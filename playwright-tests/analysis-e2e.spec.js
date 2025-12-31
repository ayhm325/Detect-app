import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// Simple E2E for the analysis flow
test('upload image -> analyze -> shows result card and heatmap -> saved in history', async ({ page, request, context }) => {
  // create a real patient in the DB and get a JWT + userId for them
  const out = execSync(`node scripts/create-test-patient.mjs`, { encoding: 'utf8' }).trim();
  let token = out;
  let testUserId = null;
  try {
    const parsed = JSON.parse(out);
    token = parsed.token;
    testUserId = parsed.userId;
  } catch (e) {
    // fallback: token only
  }

  const cookieUrl = process.env.PW_BASE_URL || 'http://localhost:3000';
  // Add HttpOnly auth cookie into the browser context before navigation
  const cookieHost = new URL(cookieUrl).hostname || 'localhost';
  await context.addCookies([{ name: 'token', value: token, domain: cookieHost, path: '/', httpOnly: true, secure: false, sameSite: 'Lax' }]);
  await page.goto(`${cookieUrl.replace(/\/$/, '')}/en/patient/analysis`, { waitUntil: 'load', timeout: 60000 });

  // attach file to input[type=file] — selector may vary depending on the app markup
  const filePath = path.join(process.cwd(), 'playwright-tests', 'assets', 'pw-test-image.png');
  if (!fs.existsSync(filePath)) {
    throw new Error(`E2E asset missing: ${filePath}`);
  }
  // Wait for upload input; allow longer for slow environments
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  const fileInput = await page.waitForSelector('input[type="file"]', { state: 'visible', timeout: 60000 });
  await fileInput.setInputFiles(filePath);

  // Click the Analyze button (assumes button text contains "Analyze")
  const analyzeBtn = await page.getByRole('button', { name: /Analyze/i }).first();
  await analyzeBtn.click();

  // Wait for the analyze API response
  const apiResp = await page.waitForResponse(resp => resp.url().includes('/api/analysis/analyze'), { timeout: 60000 });
  expect(apiResp.ok()).toBeTruthy();

  // Wait for visible result heading
  await page.waitForSelector('text=Analysis Result', { timeout: 20000 });

  // locate the result container by heading
  const resultCard = await page.locator('text=Analysis Result').first().locator('xpath=..');
  expect(await resultCard.count()).toBeGreaterThan(0);

  // Check heatmap image inside the result area
  const heatmap = await page.locator('img[alt="Heatmap"]');
  await expect(heatmap).toBeVisible({ timeout: 20000 });

  // Verify history via API request using the same token — poll until DB persistence completes
  // Poll the history endpoint from the browser context so HttpOnly cookie is included
  await expect.poll(async () => {
    const length = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/analysis/history');
        if (!res.ok) return 0;
        const body = await res.json();
        if (!body || !Array.isArray(body.data)) return 0;
        return body.data.length;
      } catch (e) {
        return 0;
      }
    });
    return length;
  }, { timeout: 15_000, interval: 500 }).toBeGreaterThan(0);

  // fetch the latest history entry from the browser (cookie included) and verify heatmap exists
  const latest = await page.evaluate(async () => {
    const res = await fetch('/api/analysis/history');
    if (!res.ok) return null;
    const b = await res.json();
    return (b && Array.isArray(b.data) && b.data.length > 0) ? b.data[0] : null;
  });
  expect(latest).toBeTruthy();
  expect(latest.heatmapUrl || latest.heatmap_url).toBeTruthy();
  // store testUserId on the test context for cleanup
  test.info().attachments = test.info().attachments || [];
  test.info()._testUserId = testUserId;
});

test.afterAll(async () => {
  // attempt to clean up created test user and analysis records
  try {
    const userId = test.info()._testUserId;
    if (userId) {
      execSync(`node scripts/delete-test-user.mjs ${userId}`, { stdio: 'inherit' });
    }
  } catch (e) {
    console.warn('cleanup failed', e && e.message);
  }
});
