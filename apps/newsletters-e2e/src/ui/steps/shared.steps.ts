import { Given } from './fixtures';

Given(
	"the user does not have the 'edit everything' permission",
	async ({ page }) => {
		// NOTE: We are mocking the network response here rather than testing this fully end-to-end.
		// Currently, the E2E test environment boots with USE_DEVELOPER_PROFILE=true, which forces
		// the backend to treat all requests as coming from an admin user. Until the test setup is
		// updated to allow impersonating standard users via JWT headers, we intercept the API call
		// to simulate the 403 rejection.
		await page.route('**/api/currentstep', async (route) => {
			await route.fulfill({
				status: 403,
				contentType: 'application/json',
				body: JSON.stringify({
					errorMessage: 'You do not have permissions to create or edit drafts.',
					currentStepId: 'intro',
					hasPersistentError: true,
				}),
			});
		});
	},
);
