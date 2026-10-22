import type {
	EditionId,
	Layout,
	NewsletterToolPermission,
	UserPermissions,
} from '@newsletters-nx/newsletters-data-client';
import {
	denyAll,
	editionNames,
	grantAll,
	NewsletterToolPermissionSchema,
} from '@newsletters-nx/newsletters-data-client';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { createBdd, defineParameterType } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, Then, When } = createBdd(test, {
	tags: '@feature-hub-edition-permissions',
});

const testLayout: Layout = {
	groups: [
		{ title: 'News', newsletters: [] },
		{ title: 'Opinion', newsletters: [] },
	],
};

defineParameterType({
	name: 'permission',
	regexp: /editEverything|useJsonEditor/,
	transformer: (s) => NewsletterToolPermissionSchema.parse(s),
});

const mockUserPermissions = async (
	page: Page,
	permissions: UserPermissions,
) => {
	await page.route('**/api/user/permissions', async (route) => {
		await route.fulfill({ json: { ok: true, data: permissions } });
	});
};

Given(
	"the editor has the '{permission}' permission",
	async ({ page }, permission: NewsletterToolPermission) => {
		await mockUserPermissions(page, {
			...denyAll(),
			[permission]: true,
		});
	},
);

Given(
	"the editor does not have the '{permission}' permission",
	async ({ page }, permission: NewsletterToolPermission) => {
		await mockUserPermissions(page, {
			...grantAll(),
			[permission]: false,
		});
	},
);

When(
	"the editor navigates to the 'edit layout' page for edition '{edition}'",
	async ({ page, storedLayouts }, edition: EditionId) => {
		await storedLayouts.create(edition, testLayout);
		await page.goto(`/layouts/edit/${edition.toLowerCase()}`);
	},
);

Then(
	'the user will see the header and a list of editable sections',
	async ({ page }) => {
		await expect(
			page.getByRole('heading', { level: 2, name: editionNames.UK }),
		).toBeVisible();
		await expect(
			page.getByRole('button', { name: 'Save and publish layout' }),
		).toBeVisible();

		for (const { title } of testLayout.groups) {
			await expect(
				page
					.getByRole('region', { name: title, exact: true })
					.getByRole('textbox', { name: 'Section title' }),
			).toHaveValue(title);
		}
	},
);

Then(
	"the user will see a 'Permission Denied' error message",
	async ({ page }) => {
		await expect(
			page.getByRole('heading', {
				name: 'You do not have permission for this area of the Newsletters tool',
			}),
		).toBeVisible();
	},
);
