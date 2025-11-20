import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const baseURL = process.env.BASE_URL || 'http://localhost:4200';
const apiURL = process.env.API_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: 60000,
  
  reporter: [
    ['html', { 
      outputFolder: isCI 
        ? '../../dist/.playwright/apps/newsletters-e2e/playwright-report' 
        : './playwright-report',
      open: 'never'
    }],
    ['list'],
  ],
  
  outputDir: isCI 
    ? '../../dist/.playwright/apps/newsletters-e2e/test-results' 
    : './test-results',
  
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Start BOTH API and UI servers
  webServer: [
    {
      command: 'USE_IN_MEMORY_STORAGE=true npx nx serve newsletters-api',
      url: apiURL,
      reuseExistingServer: !isCI,
      timeout: 120000,
    },
    {
      command: 'USE_IN_MEMORY_STORAGE=true npx nx serve newsletters-ui',
      url: baseURL,
      reuseExistingServer: !isCI,
      timeout: 120000,
    },
  ],
});