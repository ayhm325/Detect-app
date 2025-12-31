import { test, expect } from '@playwright/test';
import os from 'os';

// Helper: simulate a slow upload by intercepting the analyze API and delaying the response
async function interceptSlowUpload(page, options = {}) {
  const urlPattern = '**/api/analysis/analyze';
  await page.route(urlPattern, async (route) => {
    // emulate server processing delay and partial upload behavior by delaying response
    const delay = options.delay || 2000; // ms
    // let request proceed then respond after delay to simulate long processing/upload
    const request = route.request();
    // continue request to server (the server receives the multipart data)
    await route.continue();
    // but then delay the response to keep the upload UI showing
    await new Promise((res) => setTimeout(res, delay));
  });
}

test.describe('Upload cancellation scenarios', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // navigate to patient analysis page
    await page.goto((baseURL || '') + '/patient/analysis');
  });

  test('cancels upload when selecting a new file', async ({ page }) => {
    // intercept analyze to delay response and simulate a long upload/processing
    await interceptSlowUpload(page, { delay: 3000 });

    // set first file and start upload using small in-memory buffers
    const input = page.locator('input[type=file]');
    const file1 = { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from([0x89,0x50,0x4E,0x47]) };
    const file2 = { name: 'b.png', mimeType: 'image/png', buffer: Buffer.from([0x89,0x50,0x4E,0x47]) };
    await input.setInputFiles([{ name: file1.name, mimeType: file1.mimeType, buffer: file1.buffer }]);
    await page.locator('button:has-text("Analyze Image")').click();

    // quickly select a new file which should abort the previous upload
    await input.setInputFiles([{ name: file2.name, mimeType: file2.mimeType, buffer: file2.buffer }]);

    // UI should show no ongoing progress (either canceled or replaced by new upload)
    await expect(page.locator('text=Analyzing image, please wait...')).toHaveCount(0);
    await expect(page.locator('.w-full.bg-gray-200')).toHaveCount(0);
  });

  test('shows progress during slow upload', async ({ page }) => {
    // simulate slow server response so upload UI shows progress
    await interceptSlowUpload(page, { delay: 2000 });

    const input = page.locator('input[type=file]');
    const file = { name: 'progress.png', mimeType: 'image/png', buffer: Buffer.from([0x89,0x50,0x4E,0x47]) };
    await input.setInputFiles([{ name: file.name, mimeType: file.mimeType, buffer: file.buffer }]);
    await page.locator('button:has-text("Analyze Image")').click();

    // progress bar should become visible during the delay
    await expect(page.locator('.w-full.bg-gray-200')).toBeVisible({ timeout: 2000 });

    // cleanup by reloading (which should abort the upload)
    await page.reload();
  });

  test('cancels upload on internal navigation', async ({ page, baseURL }) => {
    await interceptSlowUpload(page, { delay: 3000 });

    const input = page.locator('input[type=file]');
    const file1 = { name: 'nav.png', mimeType: 'image/png', buffer: Buffer.from([0x89,0x50,0x4E,0x47]) };
    await input.setInputFiles([{ name: file1.name, mimeType: file1.mimeType, buffer: file1.buffer }]);
    await page.locator('button:has-text("Analyze Image")').click();

    // navigate internally to home (should trigger cancellation)
    await page.goto((baseURL || '') + '/');

    // ensure we are on the new page and previous upload is not active
    await expect(page).not.toHaveURL(/patient\/analysis/);

    // check that there is no lingering analyzing indicator on the new page
    await expect(page.locator('text=Analyzing image, please wait...')).toHaveCount(0);
  });

  test('cancels upload on reload/close', async ({ page }) => {
    await interceptSlowUpload(page, { delay: 3000 });

    const input = page.locator('input[type=file]');
    const file1 = { name: 'reload.png', mimeType: 'image/png', buffer: Buffer.from([0x89,0x50,0x4E,0x47]) };
    await input.setInputFiles([{ name: file1.name, mimeType: file1.mimeType, buffer: file1.buffer }]);
    await page.locator('button:has-text("Analyze Image")').click();

    // reload the page while uploading
    await page.reload();

    // after reload, upload state should be cleared and no upload progress visible
    await expect(page.locator('text=Analyzing image, please wait...')).toHaveCount(0);
    await expect(page.locator('.w-full.bg-gray-200')).toHaveCount(0);
  });
});
