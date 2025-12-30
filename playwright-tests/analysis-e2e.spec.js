import { test, expect } from '@playwright/test';
import path from 'path';
import { execSync } from 'child_process';

// Simple E2E for the analysis flow
test('upload image -> analyze -> shows result card and heatmap -> saved in history', async ({ page, request }) => {
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
  await page.context().addCookies([{ name: 'token', value: token, url: cookieUrl, path: '/' }]);
  await page.goto(`${cookieUrl.replace(/\/$/, '')}/en/patient/analysis`);

  // attach file to input[type=file] — selector may vary depending on the app markup
  const filePath = path.join(process.cwd(), 'playwright-tests', 'assets', 'pw-test-image.png');

  // Wait for upload input
  const fileInput = await page.waitForSelector('input[type="file"]', { state: 'visible', timeout: 5000 });
  await fileInput.setInputFiles(filePath);

  // Click the Analyze button (assumes button text contains "Analyze")
  const analyzeBtn = await page.getByRole('button', { name: /Analyze/i }).first();
  await analyzeBtn.click();

  // Wait for the analyze API response
  const apiResp = await page.waitForResponse(resp => resp.url().includes('/api/analysis/analyze'), { timeout: 20000 });
  expect(apiResp.ok()).toBeTruthy();

  // Wait for visible result heading
  await page.waitForSelector('text=Analysis Result', { timeout: 20000 });

  // locate the result container by heading
  const resultCard = await page.locator('text=Analysis Result').first().locator('xpath=..');
  expect(await resultCard.count()).toBeGreaterThan(0);

  // Check heatmap image inside the result area
  const heatmap = await page.locator('img[alt="Heatmap"]');
  await expect(heatmap).toBeVisible({ timeout: 20000 });

  // Verify history via API request using the same token
  const historyRes = await request.get('http://localhost:3000/api/analysis/history', {
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(historyRes.ok()).toBeTruthy();
  const body = await historyRes.json();
  expect(body.success).toBeTruthy();
  expect(Array.isArray(body.data)).toBeTruthy();
  expect(body.data.length).toBeGreaterThan(0);

  // ensure the most recent entry includes the uploaded image filename or heatmapUrl
  const latest = body.data[0];
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
