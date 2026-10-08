import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, Then, When } = createBdd(test, {
	tags: '@newsletters-hub-landing-page',
});

Given(
	'the editor is viewing the newsletter hub landing page',
	async ({ newslettersHubLandingPage }) => {
		await newslettersHubLandingPage.goto();
	},
);

Given(
	'the {string} edition does not have a layout configured',
	async ({ newslettersHubLandingPage }, edition: string) => {
		await newslettersHubLandingPage.removeLayout(edition);
	},
);

Given(
	'the {string} edition has {int} newsletters and {int} groups',
	async (
		{ newslettersHubLandingPage },
		edition: string,
		newsletters: number,
		groups: number,
	) => {
		await newslettersHubLandingPage.createLayout(edition, newsletters, groups);
	},
);

When(
	"the editor clicks the 'all newsletters page' link",
	async ({ newslettersHubLandingPage }) => {
		await newslettersHubLandingPage.locateAllNewsletterPagesLink().click();
	},
);

When(
	'the editor clicks the {string} title',
	async ({ newslettersHubLandingPage }, edition: string) => {
		await newslettersHubLandingPage.locateEditionTile(edition).click();
	},
);

Then(
	'the user should be navigated to the all newsletters page on the live site',
	async ({ newslettersHubLandingPage }) => {
		await expect
			.poll(() => newslettersHubLandingPage.getUrl(), {
				timeout: 5_000,
			})
			.toBe('https://www.theguardian.com/email-newsletters');
	},
);

Then(
	'the user should be navigated to the {string} page',
	async ({ newslettersHubLandingPage }, path: string) => {
		await expect
			.poll(() => newslettersHubLandingPage.getUrl(), { timeout: 5_000 })
			.toContain(path);
	},
);

Then(
	'the {string} tile should display the text {string}',
	async ({ newslettersHubLandingPage }, edition: string, text: string) => {
		await expect(
			newslettersHubLandingPage.locateEditionTile(edition),
		).toContainText(text);
	},
);

When(
	'the editor navigates to the newsletter hub landing page',
	async ({ newslettersHubLandingPage }) => {
		await newslettersHubLandingPage.goto();
	},
);

Then(
	'the page is displayed in the stand design',
	async ({ newslettersHubLandingPage }) => {
		await expect(
			newslettersHubLandingPage.locateStandTopBarNav(),
		).toBeVisible();
		await expect(newslettersHubLandingPage.locateStandHeading()).toBeVisible();
	},
);

Then(
	'the page is displayed in the legacy design',
	async ({ newslettersHubLandingPage, page }) => {
		await expect(newslettersHubLandingPage.locateLegacyTopBarNav()).toHaveCount(
			0,
		);
		await expect(page.getByRole('main')).toBeVisible();
		await expect(newslettersHubLandingPage.locateLegacyHeading()).toBeVisible();
	},
);
