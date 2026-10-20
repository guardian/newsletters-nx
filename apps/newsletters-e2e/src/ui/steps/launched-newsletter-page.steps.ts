import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';
import { createFixtureNewsletter } from '../../../helpers/test-fixtures';
import type { NamedNewsletterRef } from './fixtures';
import { Given, Then, When } from './fixtures';

type NamedNewsletters = { refsByName: Record<string, NamedNewsletterRef> };
type FixtureOverrides = Parameters<typeof createFixtureNewsletter>[1];

const createLaunched = async (
	request: APIRequestContext,
	namedNewsletters: NamedNewsletters,
	name: string,
	overrides: FixtureOverrides = {},
): Promise<string> => {
	const { identityName, listId } = await createFixtureNewsletter(request, {
		name,
		...overrides,
	});
	namedNewsletters.refsByName[name] = {
		kind: 'launched',
		identityName,
		listId,
	};
	return identityName;
};

const identityNameFor = (
	namedNewsletters: NamedNewsletters,
	name: string,
): string => {
	const ref = namedNewsletters.refsByName[name];
	if (ref?.kind !== 'launched') {
		throw new Error(`No launched newsletter named "${name}" in this scenario`);
	}
	return ref.identityName;
};

Given(
	'a launched newsletter {string} with identity name {string}',
	async ({ request, namedNewsletters }, name: string, identityName: string) => {
		await createLaunched(request, namedNewsletters, name, { identityName });
	},
);

When('the editor goes to {string}', async ({ page }, path: string) => {
	await page.goto(path);
});

When(
	'the editor opens the detail page for {string}',
	async ({ page, namedNewsletters }, name: string) => {
		await page.goto(`/newsletters/${identityNameFor(namedNewsletters, name)}`);
	},
);

Then(
	'the detail page for {string} is shown',
	async ({ page }, name: string) => {
		await expect(page).toHaveURL(/\/newsletters\/[^/]+\/details$/);
		await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
	},
);

Then('the editor sees the not found page', async ({ page }) => {
	await expect(page.getByText('NOT FOUND!')).toBeVisible();
});
