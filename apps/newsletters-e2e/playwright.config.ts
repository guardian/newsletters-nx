import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const baseURL = process.env.BASE_URL || 'http://localhost:4200';

export default defineConfig({
	testDir: './src',
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	workers: isCI ? 1 : undefined,
	timeout: 60000,

	reporter: [
		[
			'html',
			{
				outputFolder: isCI
					? '../../dist/.playwright/apps/newsletters-e2e/playwright-report'
					: './playwright-report',
				open: 'never',
			},
		],
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

	// CI: API is already started in GitHub Actions workflow
	// Local: npm run dev starts both API and UI
	webServer: isCI
		? {
				command: 'npx vite preview --config ../newsletters-ui/vite.config.ts',
				url: baseURL,
				reuseExistingServer: false,
				timeout: 300000,
			}
		: {
				command: 'npm run dev',
				url: baseURL,
				reuseExistingServer: true,
				timeout: 180000,
			},
});
