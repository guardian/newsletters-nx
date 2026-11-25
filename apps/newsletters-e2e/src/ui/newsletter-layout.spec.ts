import type {
	NewsletterData,
	RenderingOptions,
} from '@newsletters-nx/newsletters-data-client';
import { expect, test } from '@playwright/test';
import { patchNewsletter } from '../../helpers/draft-newsletter';
import {
	createFixtureNewsletter,
	deleteFixtureNewsletter,
} from '../../helpers/test-fixtures';

const id = 'playwright-article-test';
const details = `/newsletters/${id}/details`;
const layout = `/newsletters/${id}/layout`;
const preview = '/api/rendering-templates/preview';
const title = 'Newsletter email preview';
const hiddenFrame = 'iframe[aria-hidden="true"][inert]';
const gap = '<div style="height:700px"></div>';

const sample = (options?: RenderingOptions) => ({
	ok: true,
	data: {
		html: `<!doctype html><h1>${options?.displayDate ? 'Dated edition' : 'Test edition'}</h1>${gap}<h2>Unrelated story</h2>${gap}${(options?.readMoreSections ?? []).map(({ subheading }) => `<h2>${subheading}</h2>${gap}`).join('')}<footer>${options?.contactEmail ?? 'Default contact'}</footer>${gap}`,
		warnings: [],
	},
});

const block = (subheading: string) => ({
	subheading,
	wording: 'Visit the Guardian',
	onwardPath: '/food',
});

test.beforeEach(async ({ page }) => {
	await page.route('**/api/user/permissions', (route) =>
		route.fulfill({ json: { ok: true, data: { editEverything: true } } }),
	);
	await page.route(`**${preview}`, (route) => {
		const { renderingOptions } = route
			.request()
			.postDataJSON() as NewsletterData;
		return route.fulfill({ json: sample(renderingOptions) });
	});
});

test('keeps width selection usable in the saved preview at narrow widths', async ({
	page,
}) => {
	await page.setViewportSize({ width: 393, height: 850 });
	await page.goto(layout);
	await expect(
		page.getByRole('heading', { name: 'Newsletter layout preview' }),
	).toBeVisible();
	await expect(page.getByRole('tab', { name: 'Layout' })).toHaveAttribute(
		'aria-selected',
		'true',
	);
	const previewRegion = page.getByRole('region', { name: 'Email preview' });
	const frame = page.getByTitle(title);
	await expect(
		previewRegion.getByRole('button', { name: '650 px' }),
	).toHaveAttribute('aria-pressed', 'true');
	await expect
		.poll(async () => (await frame.boundingBox())?.height)
		.toBeGreaterThan(900);
	await expect(frame).toHaveCSS('width', '650px');
	await expect
		.poll(async () => (await frame.boundingBox())?.width)
		.toBeLessThan(350);
	await previewRegion.getByRole('button', { name: '320 px' }).click();
	await expect(frame).toHaveCSS('width', '320px');
	await expect(
		previewRegion.getByRole('button', { name: '320 px' }),
	).toHaveAttribute('aria-pressed', 'true');
});

test('fills the desktop editor with a short preview without stretching the email', async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 2160 });
	await page.route(`**${preview}`, (route) =>
		route.fulfill({
			json: {
				ok: true,
				data: {
					html: '<!doctype html><h1>Short edition</h1>',
					warnings: [],
				},
			},
		}),
	);
	await page.goto(layout);
	await page.getByRole('link', { name: 'Edit layout' }).click();
	const editor = page.getByRole('main');
	await expect(
		editor.getByRole('heading', { name: 'Edit newsletter layout' }),
	).toBeVisible();
	await expect(page.getByRole('dialog')).toHaveCount(0);
	const previewRegion = editor.getByRole('region', { name: 'Email preview' });
	const controls = editor.getByRole('region', { name: 'Layout controls' });
	const frame = editor.getByTitle(title);
	const headline = frame.contentFrame().getByRole('heading', {
		name: 'Short edition',
	});
	await expect(headline).toBeVisible();
	const { height, contentHeight, headlineTop, headlineHeight } =
		await headline.evaluate((element) => {
			const { scrollingElement } = element.ownerDocument;
			const { top, height: headlineHeight } = element.getBoundingClientRect();
			return {
				height: scrollingElement?.clientHeight,
				contentHeight: scrollingElement?.scrollHeight,
				headlineTop: top,
				headlineHeight,
			};
		});
	expect(contentHeight).toBe(height);
	expect(headlineTop + headlineHeight).toBeLessThan(100);
	expect(
		await controls.evaluate((el) => el.scrollHeight - el.clientHeight),
	).toBe(0);
	const formBounds = (await editor.locator('form').boundingBox())!;
	const formBottom = formBounds.y + formBounds.height;
	const previewBounds = (await frame.boundingBox())!;
	const previewBottom = previewBounds.y + previewBounds.height;
	expect(previewBottom).toBeLessThan(formBottom);
	expect(formBottom - previewBottom).toBeLessThan(32);

	const toolbar = previewRegion.getByRole('group', { name: 'Preview width' });
	const segments = (await toolbar.locator(':scope > div').boundingBox())!;
	const first = (await toolbar
		.getByRole('button', { name: '320 px' })
		.boundingBox())!;
	const last = (await toolbar
		.getByRole('button', { name: '650 px' })
		.boundingBox())!;
	const toolbarBounds = (await toolbar.boundingBox())!;
	expect(first.y).toBeCloseTo(last.y);
	expect(segments.width).toBeCloseTo(last.x + last.width - first.x);
	expect(segments.x + segments.width).toBeCloseTo(
		toolbarBounds.x + toolbarBounds.width,
	);
});

test('scrolls either editor pane independently on a short desktop viewport', async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 600 });
	await page.goto(`${layout}/edit`);
	const editor = page.getByRole('main');
	const controls = editor.getByRole('region', { name: 'Layout controls' });
	const frame = editor.getByTitle(title);
	const header = editor.locator('form header');
	const cancel = header.getByRole('button', { name: 'Cancel' });
	const save = header.getByRole('button', { name: 'Save layout' });
	const previewScroll = () =>
		frame.evaluate(
			(iframe: HTMLIFrameElement) => iframe.contentWindow?.scrollY,
		);
	const controlsScroll = () =>
		controls.evaluate((element) => element.scrollTop);
	await expect(frame).toBeVisible();
	await expect(cancel).toBeInViewport({ ratio: 1 });
	await expect(save).toBeInViewport({ ratio: 1 });
	const initialCancel = await cancel.boundingBox();
	const initialSave = await save.boundingBox();
	const initialPreview = await frame.boundingBox();
	const pageOverflow = () =>
		page.evaluate(
			() =>
				document.documentElement.scrollHeight -
				document.documentElement.clientHeight,
		);
	expect(await pageOverflow()).toBe(0);

	await controls.hover();
	await page.mouse.wheel(0, 250);
	await expect.poll(controlsScroll).toBeGreaterThan(0);
	const scrolledControls = await controlsScroll();
	expect(await previewScroll()).toBe(0);

	await frame.hover();
	await page.mouse.wheel(0, 250);
	await expect.poll(previewScroll).toBeGreaterThan(0);
	expect(await controlsScroll()).toBe(scrolledControls);
	expect(await frame.boundingBox()).toEqual(initialPreview);
	expect(await cancel.boundingBox()).toEqual(initialCancel);
	expect(await save.boundingBox()).toEqual(initialSave);
	expect(await page.evaluate(() => window.scrollY)).toBe(0);
	expect(await editor.evaluate((el) => el.scrollHeight - el.clientHeight)).toBe(
		0,
	);

	await cancel.click();
	await expect(page).toHaveURL(layout);
	await expect.poll(pageOverflow).toBeGreaterThan(0);
});

test('opens a read-only Layout tab for fronts-based newsletters', async ({
	page,
}) => {
	const frontsId = 'playwright-fronts-test';
	const frontsLayout = `/newsletters/${frontsId}/layout`;
	await page.goto(`/newsletters/${frontsId}/details`);
	await page.getByRole('tab', { name: 'Layout' }).click();
	await expect(page).toHaveURL(frontsLayout);
	await expect(
		page.getByRole('tab', { name: 'Layout', selected: true }),
	).toBeVisible();
	await expect(
		page.frameLocator(`iframe[title="${title}"]`).getByRole('heading', {
			name: 'Test edition',
		}),
	).toBeVisible();
	await expect(page.getByRole('link', { name: 'Edit layout' })).toHaveCount(0);

	await page.goBack();
	await expect(
		page.getByRole('tab', { name: 'Details', selected: true }),
	).toBeVisible();
	await page.goto(`${frontsLayout}/edit`);
	await expect(page).toHaveURL(frontsLayout);
	await page.goto(`/launched/rendering-options/${frontsId}`);
	await expect(page).toHaveURL(frontsLayout);
});

test('crossfades from the previous headline to the updated headline', async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto(`${layout}/edit`);
	const headline = page.frameLocator(`iframe[title="${title}"]`).locator('h1');
	await expect(headline).toHaveText('Test edition');
	await page.getByText('Show date', { exact: true }).click();
	await expect(headline).toHaveText('Dated edition');
	const previous = page.locator(hiddenFrame);
	await expect(page.frameLocator(hiddenFrame).locator('h1')).toHaveText(
		'Test edition',
	);
	await expect(previous).toHaveCSS('animation-duration', '0.85s');
	await expect(previous).toHaveCSS('pointer-events', 'none');
	await expect(previous).toHaveCount(0);
	await expect(headline).toHaveText('Dated edition');
});

test('switches to the updated preview without a fade in reduced motion mode', async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(`${layout}/edit`);
	const headline = page.frameLocator(`iframe[title="${title}"]`).locator('h1');
	await expect(headline).toHaveText('Test edition');
	await page.getByRole('checkbox', { name: 'Show date' }).press('Space');
	await expect(headline).toHaveText('Dated edition');
	await expect(page.locator(hiddenFrame)).toHaveCount(0);
});

test('jumps to the latest unsaved edit without moving the editor, and keeps its place for a missing section', async ({
	page,
}) => {
	let allowOlderReply: () => void = () => undefined;
	const holdOlderReply = new Promise<void>((resolve) => {
		allowOlderReply = resolve;
	});
	await page.route(`**${preview}`, async (route) => {
		const { renderingOptions } = route
			.request()
			.postDataJSON() as NewsletterData;
		if (renderingOptions?.contactEmail === 'older@example.com') {
			await holdOlderReply;
		}
		await route
			.fulfill({ json: sample(renderingOptions) })
			.catch(() => undefined);
	});
	await page.goto(details);
	await page.getByRole('tab', { name: 'Layout' }).click();
	await page.getByRole('link', { name: 'Edit layout' }).click();
	const status = page
		.getByRole('region', { name: 'Email preview' })
		.getByRole('status');
	const frame = page.frameLocator(`iframe[title="${title}"]`);
	const footer = frame.locator('footer');
	await expect(footer).toHaveText('Default contact');
	await page.getByRole('button', { name: '375 px' }).click();
	await expect(page.getByTitle(title)).toHaveCSS('width', '375px');
	const email = page.getByRole('textbox', { name: 'Custom footer email' });
	await email.scrollIntoViewIfNeeded();
	const hostScroll = await page.evaluate(() => window.scrollY);
	const started = page.waitForRequest(
		(request) =>
			request.url().endsWith(preview) &&
			request.postData()?.includes('older@example.com') === true,
	);
	await email.fill('older@example.com');
	await started;
	try {
		await expect(status).toBeEmpty();
		await expect(footer).toHaveText('Default contact');
		await email.fill('latest@example.com');
		await expect(footer).toHaveText('latest@example.com');
		await expect
			.poll(() =>
				footer.evaluate((element) => element.getBoundingClientRect().top),
			)
			.toBeLessThan(30);
		await expect(email).toBeFocused();
		await expect
			.poll(() => page.evaluate(() => window.scrollY))
			.toBe(hostScroll);
	} finally {
		allowOlderReply();
	}
	await expect(footer).toHaveText('latest@example.com');
	await page.getByText('Show image captions', { exact: true }).click();
	await expect(status).toHaveText(
		'The affected section is not in this sample edition.',
	);
	await expect(page.locator(hiddenFrame)).toHaveCount(0);
	await expect
		.poll(() =>
			footer.evaluate((element) => element.getBoundingClientRect().top),
		)
		.toBeLessThan(30);
});

test('jumps to a rendered email caption and to its image when hidden', async ({
	page,
}) => {
	const image =
		'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22/%3E';
	await page.route(`**${preview}`, (route) => {
		const { renderingOptions } = route
			.request()
			.postDataJSON() as NewsletterData;
		const caption = renderingOptions?.displayImageCaptions
			? `<tr><td class="text text-with-border"><div><img src="${image}#camera" alt="camera"> Sample caption</div></td></tr>`
			: '';
		return route.fulfill({
			json: {
				ok: true,
				data: {
					html: `<!doctype html><img src="${image}#banner" alt="Banner" width="100" height="80">${gap}<table><tr><td><table><tr><td><img src="${image}#article" alt="Article image" width="100" height="80"></td></tr></table></td></tr>${caption}</table>${gap}`,
					warnings: [],
				},
			},
		});
	});
	await page.goto(`${layout}/edit`);
	const frame = page.frameLocator(`iframe[title="${title}"]`);
	const articleImage = frame.getByRole('img', { name: 'Article image' });
	const caption = frame.getByRole('cell', { name: 'camera Sample caption' });
	const toggle = page.getByText('Show image captions', { exact: true });
	const status = page
		.getByRole('region', { name: 'Email preview' })
		.getByRole('status');
	const offsetFromLanding = (element: Element) =>
		Math.abs(element.getBoundingClientRect().top - 12);
	await expect(articleImage).toBeAttached();
	await toggle.click();
	await expect.poll(() => caption.evaluate(offsetFromLanding)).toBeLessThan(3);
	await expect(status).toBeEmpty();
	await page.getByTitle(title).evaluate((iframe: HTMLIFrameElement) => {
		iframe.contentWindow?.scrollTo(0, 0);
	});
	await toggle.click();
	await expect(caption).toHaveCount(0);
	await expect
		.poll(() => articleImage.evaluate(offsetFromLanding))
		.toBeLessThan(3);
	await expect(status).toBeEmpty();
});

test('removing an item jumps to the following surviving item', async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.route(`**/api/newsletters/${id}`, async (route) => {
		const response = await route.fetch();
		const payload = (await response.json()) as {
			ok: true;
			data: NewsletterData;
		};
		await route.fulfill({
			json: {
				...payload,
				data: {
					...payload.data,
					renderingOptions: {
						...payload.data.renderingOptions,
						readMoreSections: [
							block('Read more A'),
							block('Read more B'),
							block('Read more C'),
						],
					},
				},
			},
		});
	});
	await page.goto(`${layout}/edit`);
	const frame = page.frameLocator(`iframe[title="${title}"]`);
	const next = frame.getByRole('heading', { name: 'Read more C' });
	const removed = frame.getByRole('heading', { name: 'Read more B' });
	await expect(removed).toBeAttached();
	await page.getByRole('button', { name: 'Remove read more 2' }).click();
	await expect(removed).toHaveCount(0);
	const previousItem = page.frameLocator(hiddenFrame).locator('h2', {
		hasText: 'Read more B',
	});
	await expect
		.poll(() =>
			previousItem.evaluate((element) =>
				Math.abs(element.getBoundingClientRect().top - 12),
			),
		)
		.toBeLessThan(3);
	await expect
		.poll(() => next.evaluate((element) => element.getBoundingClientRect().top))
		.toBeLessThan(30);
});

test('saves only layout edits and protects unsaved navigation', async ({
	page,
	request,
}) => {
	const latestBannerUrl = 'https://media.guim.co.uk/latest-test-banner.jpg';
	const renderingOptions: RenderingOptions = {
		displayDate: false,
		displayStandfirst: false,
		displayImageCaptions: false,
		displayNewsletterName: true,
		contactEmail: 'saved@example.com',
		mainBannerUrl: 'https://media.guim.co.uk/test-banner.jpg',
	};
	const { identityName, listId } = await createFixtureNewsletter(request, {
		renderingOptions,
	});
	const fixtureLayout = `/newsletters/${identityName}/layout`;
	try {
		await page.goto(`${fixtureLayout}/edit`);
		const email = page.getByRole('textbox', { name: 'Custom footer email' });
		await expect(email).toHaveValue('saved@example.com');
		await email.clear();
		await page.getByRole('button', { name: 'Cancel' }).click();
		await expect(
			page.getByRole('dialog', { name: 'Discard unsaved changes?' }),
		).toBeVisible();
		await page
			.getByRole('button', { name: 'Keep editing', exact: true })
			.click();
		await expect(email).toHaveValue('');
		await patchNewsletter(request, listId, {
			renderingOptions: { ...renderingOptions, mainBannerUrl: latestBannerUrl },
		});
		const saved = page.waitForRequest(
			(req) =>
				req.method() === 'PATCH' &&
				req.url().endsWith(`/api/newsletters/${listId}`),
		);
		await page.getByRole('button', { name: 'Save layout' }).click();
		const patch: unknown = (await saved).postDataJSON();
		expect(patch).toEqual({
			renderingOptions: {
				...renderingOptions,
				contactEmail: null,
				mainBannerUrl: latestBannerUrl,
			},
		});
		await expect(page).toHaveURL(new RegExp(`${fixtureLayout}$`));
		await page.getByRole('link', { name: 'Edit layout' }).click();
		await expect(email).toHaveValue('');
		await page.getByText('Show date', { exact: true }).click();
		await page.getByRole('button', { name: 'Cancel' }).click();
		await page.getByRole('button', { name: 'Discard changes' }).click();
		await expect(page).toHaveURL(new RegExp(`${fixtureLayout}$`));
	} finally {
		await deleteFixtureNewsletter(request, listId);
	}
});

test('old Stand links and direct edit URLs respect newsletter type and permissions', async ({
	page,
}) => {
	await page.goto(`/launched/rendering-options/${id}`);
	await expect(page).toHaveURL(new RegExp(`${layout}/edit$`));
	await page.goto(`/launched/preview/${id}`);
	await expect(page).toHaveURL(new RegExp(`${layout}$`));
	await page.route('**/api/user/permissions', (route) =>
		route.fulfill({ json: { ok: true, data: { editEverything: false } } }),
	);
	await page.goto(`/launched/rendering-options/${id}`);
	await expect(page).toHaveURL(new RegExp(`${layout}$`));
	await page.goto(`${layout}/edit`);
	await expect(page).toHaveURL(new RegExp(`${layout}$`));
	await expect(page.getByRole('link', { name: 'Edit layout' })).toHaveCount(0);
	await page.route(`**/api/newsletters/${id}`, async (route) => {
		const response = await route.fetch();
		const payload = (await response.json()) as {
			ok: true;
			data: NewsletterData;
		};
		await route.fulfill({
			json: { ...payload, data: { ...payload.data, category: 'other' } },
		});
	});
	await page.goto(`/launched/preview/${id}`);
	await expect(page).toHaveURL(new RegExp(`${details}$`));
	await expect(page.getByRole('tab', { name: 'Layout' })).toHaveCount(0);
});
