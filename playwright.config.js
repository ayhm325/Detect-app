// playwright.config.js
// إعداد Playwright لاختبار Next.js

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  testDir: './playwright-tests',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
};

module.exports = config;
