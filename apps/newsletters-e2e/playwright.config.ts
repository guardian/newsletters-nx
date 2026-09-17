import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const isCI = !!process.env.CI;
const baseURL = process.env.BASE_URL ?? 'http://localhost:4200';

// Generates test files from src/ui/features/*.feature + src/ui/steps/*.ts into
// src/ui/.features-gen. playwright-bdd requires a project's `testDir` to be
// *exactly* this generated directory, so BDD tests run in their own project
// below, separate from the plain *.spec.ts project. The generated directory
// still lives under src/ui, so the path-based `playwright test src/ui`
// filter (the `test:e2e:ui-only` script) matches both projects.
const bddTestDir = defineBddConfig({
	features: 'src/ui/features/**/*.feature',
	steps: 'src/ui/steps/**/*.ts',
	outputDir: 'src/ui/.features-gen',
});

export default defineConfig({
	testDir: './src',
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	workers: 1, // Force tests to run serially.
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
		[
			'./reporters/summary-reporter.ts',
			{
				outputFile: isCI
					? '../../dist/.playwright/apps/newsletters-e2e/playwright-report/summary.txt'
					: './playwright-report/summary.txt',
			},
		],
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
			// Generated BDD spec files live in their own project (see
			// `chromium-bdd` below), so exclude them here to avoid picking
			// them up under a testDir they weren't generated for.
			testIgnore: '**/.features-gen/**',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'chromium-bdd',
			testDir: bddTestDir,
			use: { ...devices['Desktop Chrome'] },
		},
	],

	// CI: API is already started in GitHub Actions workflow
	// Local: npm run dev starts both API and UI
	webServer: isCI
		? {
				command: 'pnx vite preview --config ../newsletters-ui/vite.config.ts',
				url: baseURL,
				reuseExistingServer: false,
				timeout: 300000,
			}
		: {
				command: '(cd ../../ && pnpm run dev)',
				url: baseURL,
				reuseExistingServer: true,
				timeout: 180000,
				env: {
					USE_DEVELOPER_PROFILE: 'true',
					USE_IN_MEMORY_STORAGE: 'true',
					USE_LOCAL_USER_PERMISSIONS: 'true',
					LOCAL_USER_PROFILE_EMAIL: 'e2e-test@example.com',
					USER_PERMISSIONS: '{"e2e-test@example.com":0}',
					ENABLE_TEST_FIXTURES: 'true',
				},
			},
});
