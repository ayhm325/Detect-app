import { test, expect } from '@playwright/test';
import os from 'os';
import { execSync } from 'child_process';

// Helper: simulate a slow upload by intercepting the analyze API and delaying the response
async function interceptSlowUpload(page, options = {}) {
  const urlPattern = '**/api/analysis/analyze';
  await page.route(urlPattern, async (route) => {
    // emulate a slow request by delaying before the request is sent.
    // This is resilient to client-side aborts (which happen in cancellation tests).
    const delay = options.delay || 2000; // ms
    await new Promise((res) => setTimeout(res, delay));
    try {
      await route.continue();
    } catch (e) {
      // The request/page may have been aborted/closed; ignore.
    }
  });
}

test.describe('Upload cancellation scenarios', () => {
  test.afterEach(async ({ page }) => {
    // Avoid route handler errors after navigation/reload/abort.
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test.beforeEach(async ({ page, baseURL, context }) => {
    // Ensure we have an authenticated patient cookie so the page isn't redirected to login.
    // Increase robustness: allow create-test-patient to take slightly longer in CI by retrying briefly.
    let out = '';
    for (let i = 0; i < 3; i++) {
      try {
        out = execSync('node scripts/create-test-patient.mjs', { encoding: 'utf8', timeout: 10000 }).toString().trim();
        if (out) break;
      } catch (e) {
        // wait a bit and retry
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    let token = out;
    try { token = JSON.parse(out).token; } catch (e) {}

    const cookieUrl = process.env.PW_BASE_URL || baseURL || 'http://localhost:3000';
    const cookieHost = new URL(cookieUrl).hostname || 'localhost';
    await context.addCookies([{ name: 'token', value: token, domain: cookieHost, path: '/', httpOnly: true, secure: false, sameSite: 'Lax' }]);

    // navigate to patient analysis page
    // Use 'domcontentloaded' to avoid waiting on long-running resources while still ensuring page is interactive.
    await page.goto((baseURL || '') + '/patient/analysis', { waitUntil: 'domcontentloaded', timeout: 60000 });
  });

  test('cancels upload when selecting a new file', async ({ page }) => {
    // intercept analyze to delay response and simulate a long upload/processing
    await interceptSlowUpload(page, { delay: 3000 });

    // set first file and start upload using small in-memory buffers
    const input = page.locator('input[type="file"]').first();
    const file1 = { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from([0x89,0x50,0x4E,0x47]) };
    const file2 = { name: 'b.png', mimeType: 'image/png', buffer: Buffer.from([0x89,0x50,0x4E,0x47]) };
    await input.waitFor({ state: 'attached', timeout: 60000 });
    await input.setInputFiles([{ name: file1.name, mimeType: file1.mimeType, buffer: file1.buffer }]);
    const analyzeBtn = page.locator('button:has-text("Analyze Image")');
    await expect(analyzeBtn).toBeEnabled({ timeout: 15000 });
    await analyzeBtn.click();

    // progress UI should appear during the delayed response (bar may be 0% width initially)
    await expect(page.getByText('Cancel upload')).toBeVisible({ timeout: 5000 });

    // quickly select a new file which should abort the previous upload
    await input.setInputFiles([{ name: file2.name, mimeType: file2.mimeType, buffer: file2.buffer }]);

    // UI should show no ongoing progress (either canceled or replaced by new upload)
    await expect(page.getByRole('progressbar')).toHaveCount(0);
  });

  test('shows progress during slow upload', async ({ page }) => {
    // simulate slow server response so upload UI shows progress
    await interceptSlowUpload(page, { delay: 2000 });

    const input = page.locator('input[type="file"]').first();
    const file = { name: 'progress.png', mimeType: 'image/png', buffer: Buffer.from([0x89,0x50,0x4E,0x47]) };
    await input.waitFor({ state: 'attached', timeout: 60000 });
    await input.setInputFiles([{ name: file.name, mimeType: file.mimeType, buffer: file.buffer }]);
    const analyzeBtn = page.locator('button:has-text("Analyze Image")');
    await expect(analyzeBtn).toBeEnabled({ timeout: 15000 });
    await analyzeBtn.click();

    // progress bar should become visible during the delay
    await expect(page.getByText('Cancel upload')).toBeVisible({ timeout: 5000 });

    // cleanup by reloading (which should abort the upload)
    await page.reload();
  });

  test('cancels upload on internal navigation', async ({ page, baseURL }) => {
    await interceptSlowUpload(page, { delay: 3000 });

    const input = page.locator('input[type="file"]').first();
    const file1 = { name: 'nav.png', mimeType: 'image/png', buffer: Buffer.from([0x89,0x50,0x4E,0x47]) };
    await input.waitFor({ state: 'attached', timeout: 60000 });
    await input.setInputFiles([{ name: file1.name, mimeType: file1.mimeType, buffer: file1.buffer }]);
    await page.locator('button:has-text("Analyze Image")').click();

    // navigate internally to home (should trigger cancellation)
    await page.goto((baseURL || '') + '/');

    // ensure we are on the new page and previous upload is not active
    await expect(page).not.toHaveURL(/patient\/analysis/);

    // check that there is no lingering analyzing indicator on the new page
    await expect(page.getByRole('progressbar')).toHaveCount(0);
  });

  test('cancels upload on reload/close', async ({ page }) => {
    await interceptSlowUpload(page, { delay: 3000 });

    const input = page.locator('input[type="file"]').first();
    const file1 = { name: 'reload.png', mimeType: 'image/png', buffer: Buffer.from([0x89,0x50,0x4E,0x47]) };
    await input.waitFor({ state: 'attached', timeout: 60000 });
    await input.setInputFiles([{ name: file1.name, mimeType: file1.mimeType, buffer: file1.buffer }]);
    await page.locator('button:has-text("Analyze Image")').click();

    // reload the page while uploading
    await page.reload();

    // after reload, upload state should be cleared and no upload progress visible
    await expect(page.getByRole('progressbar')).toHaveCount(0);
  });
});
