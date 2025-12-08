import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path = require('path/win32');

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const env = process.env.ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) });

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['junit', { outputFile: 'test-results/junit/results.xml' }],
  ],
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
     baseURL: process.env.BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      "Accept": "application/json"
    }
    }
  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
