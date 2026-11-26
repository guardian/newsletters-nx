import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { newsletterCategoriesSchema } from '@newsletters-nx/newsletters-data-client';
import type { Route } from '@playwright/test';
import { expect } from '@playwright/test';
import { createFixtureNewsletter } from '@newsletters-internal/e2e/helpers/test-fixtures';
import type { NamedNewsletterRef } from './fixtures';
import { Given, Then, When } from './fixtures';

const previewEndpoint = '**/api/rendering-templates/preview';
const frameTitle = 'Newsletter email preview';
const savedOptions = {
	displayDate: true,
	displayStandfirst: false,
	displayImageCaptions: false,
};
const sample = {
	ok: true,
	data: {
		html: '<!doctype html><html lang="en"><body><h1>Sample edition</h1><a href="https://www.theguardian.com/food">Read the story</a><div style="height:1200px"></div><script>document.body.dataset.executed = "true"</script></body></html>',
		warnings: [{ message: 'Sample renderer warning.' }],
	},
};
const failRender = (route: Route) =>
	route.fulfill({ status: 502, json: { ok: false } });
const launched = (ref: NamedNewsletterRef | undefined) => {
	if (ref?.kind !== 'launched') {
		throw new Error('No layout newsletter');
	}
	return ref;
};

Given(
	'the layout sample renderer is available',
	async ({ page, namedNewsletters }) => {
		await page.route(previewEndpoint, (route) => {
			const payload = route.request().postDataJSON() as NewsletterData;
			expect(payload.identityName).toBe(
				launched(namedNewsletters.refsByName['layout']).identityName,
			);
			expect(payload.renderingOptions).toMatchObject(savedOptions);
			return route.fulfill({ json: sample });
		});
	},
);
Given(
	'a layout newsletter of category {string}',
	async ({ request, namedNewsletters }, category: string) => {
		const ref = await createFixtureNewsletter(request, {
			category: newsletterCategoriesSchema.parse(category),
			renderingOptions: savedOptions,
		});
		namedNewsletters.refsByName['layout'] = { kind: 'launched', ...ref };
	},
);
When(
	'the editor opens its layout {word}',
	async ({ page, namedNewsletters }, destination: string) => {
		const ref = launched(namedNewsletters.refsByName['layout']);
		await page.goto(
			`/newsletters/${ref.identityName}/${destination === 'preview' ? 'layout' : 'details'}`,
		);
	},
);
Then('the saved layout preview and both tabs are shown', async ({ page }) => {
	await expect(
		page.getByRole('heading', { name: 'Newsletter layout preview' }),
	).toBeVisible();
	await expect(page.getByRole('tab', { name: 'Layout' })).toHaveAttribute(
		'aria-selected',
		'true',
	);
	await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();
	await expect(
		page
			.getByTitle(frameTitle)
			.contentFrame()
			.getByRole('heading', { name: 'Sample edition' }),
	).toBeVisible();
});
When('the editor reloads the layout preview', async ({ page }) => {
	await page.reload();
});
Then('no Layout tab is offered', async ({ page }) => {
	await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible();
	await expect(page.getByRole('tab', { name: 'Layout' })).toHaveCount(0);
});
Then(
	'the editor is returned to its layout details',
	async ({ page, namedNewsletters }) => {
		const ref = launched(namedNewsletters.refsByName['layout']);
		await expect(page).toHaveURL(
			new RegExp(`/newsletters/${ref.identityName}/details$`),
		);
		await expect(page.getByTitle(frameTitle)).toHaveCount(0);
	},
);
When(
	'the editor selects preview width {int}',
	async ({ page }, width: number) => {
		await page
			.getByRole('group', { name: 'Preview width' })
			.getByRole('button', { name: `${width} px` })
			.click();
	},
);
Then('the email document uses width {int}', async ({ page }, width: number) => {
	await expect(page.getByTitle(frameTitle)).toHaveCSS('width', `${width}px`);
	await expect(
		page.getByRole('button', { name: `${width} px` }),
	).toHaveAttribute('aria-pressed', 'true');
});
Given('layout editing is allowed', async ({ page }) => {
	await page.route('**/api/user/permissions', (route) =>
		route.fulfill({ json: { ok: true, data: { editEverything: true } } }),
	);
});
Given('layout permissions cannot be loaded', async ({ page }) => {
	await page.route('**/api/user/permissions', (route) =>
		route.fulfill({ status: 503, json: { ok: false } }),
	);
});
Then(
	'the Edit layout action is {string}',
	async ({ page, namedNewsletters }, visibility: string) => {
		const action = page.getByRole('link', { name: 'Edit layout', exact: true });
		if (visibility === 'hidden') {
			await expect(action).toHaveCount(0);
		} else {
			const ref = launched(namedNewsletters.refsByName['layout']);
			await expect(action).toBeVisible();
			await expect(action).toHaveAttribute(
				'href',
				`/launched/rendering-options/${ref.identityName}`,
			);
		}
	},
);
Given('the next layout render fails', async ({ page }) => {
	await page.route(previewEndpoint, failRender);
});
Then('the layout preview explains the failure', async ({ page }) => {
	await expect(page.getByRole('status')).toContainText(
		'Could not load the email preview.',
	);
	await expect(
		page.getByRole('button', { name: 'Retry preview' }),
	).toBeVisible();
});
When('the editor retries the layout preview', async ({ page }) => {
	await page.unroute(previewEndpoint, failRender);
	await page.getByRole('button', { name: 'Retry preview' }).click();
});
Then('the layout warning is shown beside the preview', async ({ page }) => {
	await expect(
		page.getByRole('list', { name: 'Preview warnings' }),
	).toContainText('Sample renderer warning.');
});
Given('the layout viewport is mobile sized', async ({ page }) => {
	await page.setViewportSize({ width: 393, height: 850 });
});
Then('the layout preview fits within the page', async ({ page }) => {
	await expect
		.poll(() =>
			page.evaluate(
				() =>
					document.documentElement.scrollWidth -
					document.documentElement.clientWidth,
			),
		)
		.toBe(0);
	const frame = page.getByTitle(frameTitle);
	await expect(frame).toHaveCSS('width', '650px');
	await expect
		.poll(async () => (await frame.boundingBox())?.width)
		.toBeLessThan(393);
	await expect
		.poll(async () => (await frame.boundingBox())?.height)
		.toBeGreaterThan(500);
});
Then(
	'the preview email is sandboxed and its links do not navigate',
	async ({ page }) => {
		const frame = page.getByTitle(frameTitle);
		await expect(frame).toHaveAttribute('sandbox', 'allow-same-origin');
		const content = frame.contentFrame();
		await expect(content.locator('body')).not.toHaveAttribute(
			'data-executed',
			'true',
		);
		await content.getByRole('link', { name: 'Read the story' }).click();
		await expect(
			content.getByRole('heading', { name: 'Sample edition' }),
		).toBeVisible();
		await expect(page).toHaveURL(/\/layout$/);
	},
);
