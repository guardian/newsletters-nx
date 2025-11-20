import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const baseURL = process.env.BASE_URL || 'http://localhost:4200';

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  
  // Increase timeout for slow webServer startup
  timeout: 60000, // 60 seconds per test
  
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
    
    // Add more time for actions
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // Use the working command from your package.json
    command: 'USE_IN_MEMORY_STORAGE=true npx nx serve newsletters-ui',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120000, // 2 minutes for server to start
    stdout: 'pipe', // Show server output
    stderr: 'pipe',
  },
});