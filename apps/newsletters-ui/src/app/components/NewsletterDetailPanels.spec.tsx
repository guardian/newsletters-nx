import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import {
	defaultRenderingOptionsValues,
	isPartialNewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { usePermissions } from '../hooks/user-hooks';
import { NewsletterDetailPanels } from './NewsletterDetailPanels';

const scrollIntoView = vi.fn();

afterEach(() => {
	cleanup();
	Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
});

vi.mock('../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));
vi.mock('../api-requests/request-newsletter-edit', () => ({
	requestNewsletterEdit: vi.fn(),
}));
beforeEach(() => {
	vi.resetAllMocks();
	Object.defineProperty(Element.prototype, 'scrollIntoView', {
		configurable: true,
		value: scrollIntoView,
	});
});

const newsletter = (overrides: Partial<NewsletterData> = {}) =>
	({
		name: 'Afternoon update',
		listId: 123,
		status: 'live',
		theme: 'news',
		category: 'article-based',
		regionFocus: 'AU',
		frequency: 'Weekly',
		group: 'News in depth',
		signupPageCreationStatus: 'NOT_REQUESTED',
		tagCreationStatus: 'NOT_REQUESTED',
		brazeCampaignCreationStatus: 'NOT_REQUESTED',
		...overrides,
	}) as NewsletterData;

/** The text of a field's value, ignoring decorative (aria-hidden) content such as icons */
const valueFor = (label: string) => {
	// Strip the aria-hidden content from a copy, not from the page itself
	const value = screen
		.getByText(label, { exact: true, selector: 'dt' })
		.nextElementSibling?.cloneNode(true) as Element | undefined;
	value?.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove());
	return value?.textContent;
};

// Queries scoped to the panel whose heading is `name`.
const panel = (name: string) => {
	const section = screen
		.getByRole('heading', { name, level: 3 })
		.closest('section');
	if (!section) {
		throw new Error(`Expected the ${name} panel to exist`);
	}
	return within(section);
};

const allowEditing = () => {
	vi.mocked(usePermissions).mockReturnValue({
		editEverything: true,
		useJsonEditor: false,
	});
};

const startEditing = (panelName: string) => {
	fireEvent.click(panel(panelName).getByRole('button', { name: 'Edit' }));
};

const imageLabels = [
	'Main banner graphic',
	'Main banner graphic (mobile)',
	'Newsletter graphic (5:3)',
	'Newsletter square (1:1)',
];

const imageUrls = {
	mainBanner: 'https://uploads.guim.co.uk/2025/06/30/Business.jpg',
	mainBannerMobile: 'https://uploads.guim.co.uk/2025/06/30/Business_mobile.jpg',
	card: 'https://uploads.guim.co.uk/2025/06/30/Business_5-3.jpg',
	square: 'https://uploads.guim.co.uk/2025/06/30/Business_1-1.jpg',
};

const withImages = () =>
	newsletter({
		illustrationCard: imageUrls.card,
		illustrationSquare: imageUrls.square,
		renderingOptions: {
			mainBannerUrl: imageUrls.mainBanner,
			mainBannerMobileUrl: imageUrls.mainBannerMobile,
			displayDate: true,
		} as NewsletterData['renderingOptions'],
	});

const imageInput = (name: string) =>
	panel('Images').getByRole<HTMLInputElement>('textbox', { name });

const reportImage = (label: string, outcome: 'load' | 'error') => {
	const img = panel('Images')
		.getByText(label)
		.parentElement?.querySelector('img');
	if (!img) {
		throw new Error(`No preview for ${label}`);
	}
	if (outcome === 'load') {
		fireEvent.load(img);
	} else {
		fireEvent.error(img);
	}
};

describe('ImagesPanel editing', () => {
	beforeEach(allowEditing);

	const saveButton = () =>
		panel('Images').getByRole('button', { name: 'Save changes' });

	it('shows an input for each image, in order, prefilled with the current URLs', () => {
		render(<NewsletterDetailPanels newsletter={withImages()} />);
		startEditing('Images');

		const inputs = panel('Images').getAllByRole('textbox');
		expect(inputs.map((input) => input.getAttribute('aria-label'))).toEqual(
			imageLabels,
		);
		expect(inputs.map((input) => (input as HTMLInputElement).value)).toEqual([
			imageUrls.mainBanner,
			imageUrls.mainBannerMobile,
			imageUrls.card,
			imageUrls.square,
		]);
		for (const input of inputs) {
			expect(input.getAttribute('placeholder')).toBe('Paste image URL');
		}
	});

	it('shows the image size guidance with a link to the image service docs', () => {
		render(<NewsletterDetailPanels newsletter={withImages()} />);
		startEditing('Images');

		const note = panel('Images').getByRole('note');
		expect(note.querySelectorAll('p')).toHaveLength(3);
		expect(
			within(note)
				.getByRole('link', {
					name: 'this documentation from our image service',
				})
				.getAttribute('href'),
		).toBe(
			'https://www.fastly.com/documentation/reference/io/#limitations-and-constraints',
		);
	});

	it('disables Save and shows the field error when a new image fails to load', () => {
		render(<NewsletterDetailPanels newsletter={withImages()} />);
		startEditing('Images');
		fireEvent.change(imageInput('Newsletter square (1:1)'), {
			target: { value: 'https://example.com/broken.jpg' },
		});
		reportImage('Newsletter square (1:1)', 'error');

		expect(
			panel('Images').getByText(
				"Couldn't load an image from that URL. Check the link and try again.",
			),
		).toBeTruthy();
		expect(saveButton()).toHaveProperty('disabled', true);
		fireEvent.click(saveButton());
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
		expect(panel('Images').queryByRole('alert')).toBeNull();
		expect(panel('Images').getByText('Editing')).toBeTruthy();
	});

	it('disables Save while a new image is still being checked', () => {
		render(<NewsletterDetailPanels newsletter={withImages()} />);
		startEditing('Images');
		fireEvent.change(imageInput('Newsletter square (1:1)'), {
			target: { value: 'https://example.com/new.jpg' },
		});

		expect(panel('Images').getAllByText('Checking image…')).toHaveLength(
			imageLabels.length,
		);
		expect(saveButton()).toHaveProperty('disabled', true);
		fireEvent.click(saveButton());
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
		expect(panel('Images').queryByRole('alert')).toBeNull();
	});

	it('saves the image URLs, keeps other rendering options and shows the response', async () => {
		const original = withImages();
		const newSquare = 'https://uploads.guim.co.uk/2025/07/01/New_1-1.jpg';
		vi.mocked(requestNewsletterEdit).mockResolvedValue({
			ok: true,
			total: 1,
			data: { ...original, illustrationSquare: newSquare },
		});
		render(<NewsletterDetailPanels newsletter={original} />);
		startEditing('Images');
		fireEvent.change(imageInput('Newsletter square (1:1)'), {
			target: { value: newSquare },
		});
		for (const label of imageLabels) {
			reportImage(label, 'load');
		}

		fireEvent.click(saveButton());
		await panel('Images').findByRole('button', { name: 'Edit' });

		expect(requestNewsletterEdit).toHaveBeenCalledWith(123, {
			illustrationCard: imageUrls.card,
			illustrationSquare: newSquare,
			renderingOptions: {
				mainBannerUrl: imageUrls.mainBanner,
				mainBannerMobileUrl: imageUrls.mainBannerMobile,
				displayDate: true,
			},
		});
		expect(valueFor('Newsletter square (1:1)')).toBe(newSquare);
	});

	it.each([
		['illustrationCard', 'Newsletter graphic (5:3)', imageUrls.card],
		['illustrationSquare', 'Newsletter square (1:1)', imageUrls.square],
	] as const)(
		'saves %s without creating rendering options',
		async (key, label, url) => {
			const original = newsletter({ category: 'fronts-based' });
			vi.mocked(requestNewsletterEdit).mockResolvedValue({
				ok: true,
				total: 1,
				data: { ...original, [key]: url },
			});
			render(<NewsletterDetailPanels newsletter={original} />);
			startEditing('Images');
			fireEvent.change(imageInput(label), { target: { value: url } });
			reportImage(label, 'load');
			fireEvent.click(saveButton());
			await panel('Images').findByRole('button', { name: 'Edit' });
			expect(requestNewsletterEdit).toHaveBeenCalledWith(123, {
				illustrationCard: undefined,
				illustrationSquare: undefined,
				[key]: url,
			});
			const update = vi.mocked(requestNewsletterEdit).mock.calls[0]?.[1];
			expect(update).not.toHaveProperty('renderingOptions');
			expect(isPartialNewsletterData(update)).toBe(true);
			expect(valueFor(label)).toBe(url);
		},
	);
	it.each([
		['mainBannerUrl', 'Main banner graphic', imageUrls.mainBanner],
		[
			'mainBannerMobileUrl',
			'Main banner graphic (mobile)',
			imageUrls.mainBannerMobile,
		],
	] as const)(
		'initializes valid rendering options when adding %s',
		async (key, label, url) => {
			const original = newsletter({ category: 'fronts-based' });
			const renderingOptions = { ...defaultRenderingOptionsValues, [key]: url };
			vi.mocked(requestNewsletterEdit).mockResolvedValue({
				ok: true,
				total: 1,
				data: { ...original, renderingOptions },
			});
			render(<NewsletterDetailPanels newsletter={original} />);
			startEditing('Images');
			fireEvent.change(imageInput(label), { target: { value: url } });
			reportImage(label, 'load');
			fireEvent.click(saveButton());
			await panel('Images').findByRole('button', { name: 'Edit' });
			expect(requestNewsletterEdit).toHaveBeenCalledWith(123, {
				illustrationCard: undefined,
				illustrationSquare: undefined,
				renderingOptions,
			});
			expect(
				isPartialNewsletterData(
					vi.mocked(requestNewsletterEdit).mock.calls[0]?.[1],
				),
			).toBe(true);
			expect(valueFor(label)).toBe(url);
		},
	);
	it('unsets cleared images and removes cleared banners from the rendering options', async () => {
		const original = withImages();
		vi.mocked(requestNewsletterEdit).mockResolvedValue({
			ok: true,
			total: 1,
			data: original,
		});
		render(<NewsletterDetailPanels newsletter={original} />);
		startEditing('Images');
		for (const label of imageLabels) {
			fireEvent.change(imageInput(label), { target: { value: '' } });
		}

		fireEvent.click(saveButton());
		await panel('Images').findByRole('button', { name: 'Edit' });

		expect(requestNewsletterEdit).toHaveBeenCalledWith(123, {
			illustrationCard: undefined,
			illustrationSquare: undefined,
			renderingOptions: { displayDate: true },
		});
	});

	it('discards cancelled changes and starts the next edit from the saved values', () => {
		render(<NewsletterDetailPanels newsletter={withImages()} />);
		startEditing('Images');
		fireEvent.change(imageInput('Main banner graphic'), {
			target: { value: 'https://example.com/discard-me.jpg' },
		});

		fireEvent.click(panel('Images').getByRole('button', { name: 'Cancel' }));
		expect(valueFor('Main banner graphic')).toBe(imageUrls.mainBanner);

		startEditing('Images');
		expect(imageInput('Main banner graphic').value).toBe(imageUrls.mainBanner);
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
	});
});

describe('Jump to', () => {
	afterEach(() => {
		window.history.replaceState(null, '', '/');
	});

	it('links to every panel on the page', () => {
		render(<NewsletterDetailPanels newsletter={newsletter()} />);
		const links = within(
			screen.getByRole('navigation', { name: 'Jump to' }),
		).getAllByRole('link');

		expect(links.map((link) => link.textContent)).toEqual([
			'Attributes',
			'Images',
			'Copy',
			'Sign-up page and tags',
			'Integrations',
		]);
		for (const link of links) {
			const id = link.getAttribute('href')?.split('#')[1];
			expect(document.getElementById(id ?? '')).toBeTruthy();
		}
	});

	it('links stay on the current page rather than the base URL', () => {
		window.history.replaceState(
			null,
			'',
			'/newsletters/afternoon-update/details',
		);
		render(<NewsletterDetailPanels newsletter={newsletter()} />);

		expect(
			screen.getByRole('link', { name: 'Attributes' }).getAttribute('href'),
		).toBe('/newsletters/afternoon-update/details#attributes');
	});

	it('replaces the history entry, scrolls and moves focus when a link is clicked', () => {
		render(<NewsletterDetailPanels newsletter={newsletter()} />);
		const historyLength = window.history.length;
		const integrations = document.getElementById('integrations');

		fireEvent.click(screen.getByRole('link', { name: 'Integrations' }));

		expect(window.location.hash).toBe('#integrations');
		expect(window.history.length).toBe(historyLength);
		expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'start' });
		expect(scrollIntoView.mock.contexts[0]).toBe(integrations);
		expect(document.activeElement).toBe(integrations);
	});

	it('scrolls to the panel named in the address when the page opens', () => {
		window.history.replaceState(null, '', '/#integrations');
		render(<NewsletterDetailPanels newsletter={newsletter()} />);

		expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'start' });
		expect(scrollIntoView.mock.contexts[0]).toBe(
			document.getElementById('integrations'),
		);
	});

	it('does not scroll when the address has no panel', () => {
		render(<NewsletterDetailPanels newsletter={newsletter()} />);

		expect(scrollIntoView).not.toHaveBeenCalled();
	});
});

describe('NewsletterDetailPanels', () => {
	it('uses single-line inputs for Headline and Success message and textareas for other Copy fields', () => {
		allowEditing();
		render(<NewsletterDetailPanels newsletter={newsletter()} />);
		startEditing('Copy');
		for (const name of ['Headline', 'Success message']) {
			expect(screen.getByRole('textbox', { name }).tagName).toBe('INPUT');
		}
		for (const name of [
			'Sign-up description',
			'Embed description',
			'Highlight card message',
		]) {
			expect(screen.getByRole('textbox', { name }).tagName).toBe('TEXTAREA');
		}
	});

	it('does not save when a required Copy description is empty', () => {
		allowEditing();
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					signUpDescription: 'Required description',
					signUpEmbedDescription: 'Required embed',
				})}
			/>,
		);
		startEditing('Copy');
		fireEvent.change(
			screen.getByRole('textbox', { name: 'Sign-up description' }),
			{
				target: { value: '' },
			},
		);
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
		expect(screen.getByText('Editing')).toBeTruthy();
	});

	it.each([
		['signUpHeadline', 'Headline'],
		['mailSuccessDescription', 'Success message'],
		['highlightCardTitle', 'Highlight card message'],
	] as const)(
		'unsets the optional Copy field %s when cleared',
		async (key, label) => {
			allowEditing();
			const original = newsletter({
				[key]: 'Remove this',
				signUpDescription: 'Description',
				signUpEmbedDescription: 'Embed',
			});
			vi.mocked(requestNewsletterEdit).mockResolvedValue({
				ok: true,
				total: 1,
				data: { ...original, [key]: undefined },
			});
			render(<NewsletterDetailPanels newsletter={original} />);
			startEditing('Copy');
			fireEvent.change(screen.getByRole('textbox', { name: label }), {
				target: { value: '' },
			});
			fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
			await panel('Copy').findByRole('button', { name: 'Edit' });
			expect(requestNewsletterEdit).toHaveBeenCalledWith(123, {
				signUpHeadline: undefined,
				signUpDescription: 'Description',
				signUpEmbedDescription: 'Embed',
				mailSuccessDescription: undefined,
				highlightCardTitle: undefined,
			});
			expect(valueFor(label)).toBe('Not set');
		},
	);

	it('saves only Copy fields and shows the persisted response', async () => {
		allowEditing();
		const original = newsletter({
			signUpHeadline: 'Original',
			signUpDescription: 'Description',
			signUpEmbedDescription: 'Embed',
		});
		vi.mocked(requestNewsletterEdit).mockResolvedValue({
			ok: true,
			total: 1,
			data: { ...original, signUpHeadline: 'Updated headline' },
		});
		render(<NewsletterDetailPanels newsletter={original} />);
		startEditing('Copy');
		fireEvent.change(screen.getByRole('textbox', { name: 'Headline' }), {
			target: { value: 'Updated headline' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		await panel('Copy').findByRole('button', { name: 'Edit' });
		expect(requestNewsletterEdit).toHaveBeenCalledWith(123, {
			signUpHeadline: 'Updated headline',
			signUpDescription: 'Description',
			signUpEmbedDescription: 'Embed',
			mailSuccessDescription: undefined,
			highlightCardTitle: undefined,
		});
		expect(valueFor('Headline')).toBe('Updated headline');
	});

	it('discards cancelled Copy values and starts the next edit from saved values', () => {
		allowEditing();
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({ signUpHeadline: 'Original' })}
			/>,
		);
		startEditing('Copy');
		fireEvent.change(screen.getByRole('textbox', { name: 'Headline' }), {
			target: { value: 'Discard me' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(valueFor('Headline')).toBe('Original');
		startEditing('Copy');
		expect(
			screen.getByRole<HTMLInputElement>('textbox', { name: 'Headline' }).value,
		).toBe('Original');
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
	});

	it.each([
		['Save rejected', 'Save rejected'],
		[
			undefined,
			'Changes could not be saved. Your edits have been kept. Please try again.',
		],
	])(
		'retains Copy inputs and shows one error when saving fails (%s)',
		async (message, expectedError) => {
			allowEditing();
			vi.mocked(requestNewsletterEdit).mockResolvedValue({
				ok: false,
				message,
			});
			render(
				<NewsletterDetailPanels
					newsletter={newsletter({
						signUpDescription: 'Description',
						signUpEmbedDescription: 'Embed',
					})}
				/>,
			);
			startEditing('Copy');
			fireEvent.change(screen.getByRole('textbox', { name: 'Headline' }), {
				target: { value: 'Keep this' },
			});
			fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
			const alert = await screen.findByRole('alert');
			expect(alert.textContent).toBe(expectedError);
			expect(screen.getAllByRole('alert')).toHaveLength(1);
			expect(
				screen.getByRole<HTMLInputElement>('textbox', { name: 'Headline' })
					.value,
			).toBe('Keep this');
			expect(screen.getByText('Editing')).toBeTruthy();
		},
	);

	it('shows the Copy panel above Sign-up page and tags with plain text values', () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					signUpHeadline: 'Your afternoon briefing',
					signUpDescription: 'Sign up for the daily news',
					signUpEmbedDescription: 'A short news briefing',
					mailSuccessDescription: 'Thank you for signing up',
					highlightCardTitle: 'The news you need',
				})}
			/>,
		);

		expect(
			screen
				.getAllByRole('heading', { level: 3 })
				.map((heading) => heading.textContent),
		).toEqual([
			'Attributes',
			'Images',
			'Copy',
			'Sign-up page and tags',
			'Integrations',
		]);
		expect(valueFor('Headline')).toBe('Your afternoon briefing');
		expect(valueFor('Sign-up description')).toBe('Sign up for the daily news');
		expect(valueFor('Embed description')).toBe('A short news briefing');
		expect(valueFor('Success message')).toBe('Thank you for signing up');
		expect(valueFor('Highlight card message')).toBe('The news you need');
		expect(panel('Copy').queryByRole('link')).toBeNull();
		expect(panel('Copy').queryByRole('textbox')).toBeNull();
	});

	it.each([undefined, ''])(
		'shows "Not set" for copy values that are %s',
		(value) => {
			render(
				<NewsletterDetailPanels
					newsletter={newsletter({
						signUpHeadline: value,
						signUpDescription: value,
						signUpEmbedDescription: value,
						mailSuccessDescription: value,
						highlightCardTitle: value,
					})}
				/>,
			);

			for (const label of [
				'Headline',
				'Sign-up description',
				'Embed description',
				'Success message',
				'Highlight card message',
			]) {
				expect(valueFor(label)).toBe('Not set');
			}
		},
	);

	it.each([
		['NOT_REQUESTED', 'Not requested'],
		['REQUESTED', 'Requested'],
		['COMPLETED', 'Completed'],
	] as const)('shows creation status badges for %s', (status, label) => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					signupPageCreationStatus: status,
					tagCreationStatus: status,
				})}
			/>,
		);

		expect(valueFor('Sign-up page creation status')).toBe(label);
		expect(valueFor('Tag creation status')).toBe(label);
	});

	it('uses the independent creation statuses, not the newsletter status', () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					status: 'live',
					signupPageCreationStatus: 'COMPLETED',
					tagCreationStatus: 'REQUESTED',
				})}
			/>,
		);

		expect(valueFor('Newsletter status')).toBe('Live');
		expect(valueFor('Sign-up page creation status')).toBe('Completed');
		expect(valueFor('Tag creation status')).toBe('Requested');
	});

	it('shows the attributes', () => {
		render(<NewsletterDetailPanels newsletter={newsletter()} />);

		expect(valueFor('Name')).toBe('Afternoon update');
		expect(valueFor('Newsletter status')).toBe('Live');
		expect(valueFor('Pillar')).toBe('News');
		expect(valueFor('Region focus')).toBe('AU');
		expect(valueFor('Frequency')).toBe('Weekly');
		expect(valueFor('Type of newsletter')).toBe('Article based');
		expect(valueFor('MMA group')).toBe('News in depth');
	});

	it('shows "Not set" for details that are missing', () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					regionFocus: undefined,
					frequency: '',
					// The schema says group is required, but guard against bad API data.
					group: null as unknown as string,
				})}
			/>,
		);

		expect(valueFor('Region focus')).toBe('Not set');
		expect(valueFor('Frequency')).toBe('Not set');
		expect(valueFor('MMA group')).toBe('Not set');
	});

	it('shows the images, or "Not set" when empty', () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					illustrationCard:
						'https://uploads.guim.co.uk/2025/06/30/Business_5-3.jpg',
					renderingOptions: {
						mainBannerUrl: 'https://uploads.guim.co.uk/2025/06/30/Business.jpg',
					} as NewsletterData['renderingOptions'],
				})}
			/>,
		);
		expect(valueFor('Main banner graphic')).toBe(
			'https://uploads.guim.co.uk/2025/06/30/Business.jpg',
		);
		expect(
			screen
				.getByRole('group', { name: 'Main banner graphic' })
				.querySelector('img')
				?.getAttribute('src'),
		).toBe('https://uploads.guim.co.uk/2025/06/30/Business.jpg');
		expect(valueFor('Main banner graphic (mobile)')).toBe('Not set');
		expect(valueFor('Newsletter graphic (5:3)')).toBe(
			'https://uploads.guim.co.uk/2025/06/30/Business_5-3.jpg',
		);
		expect(valueFor('Newsletter square (1:1)')).toBe('Not set');
	});

	it('shows the sign-up page and tags from the newsletter', () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					signupPage: '/global/sign-up-for-afternoon-update',
					seriesTag: 'news/series/afternoon-update',
					seriesTagDescription: 'The afternoon news briefing',
					composerTag: 'Afternoon update (newsletter sign up)',
					composerCampaignTag: 'Sign up for the afternoon briefing',
				})}
			/>,
		);

		expect(
			panel('Sign-up page and tags')
				.getAllByRole('heading', { level: 4 })
				.map((heading) => heading.textContent),
		).toEqual(['Sign-up page', 'Tags']);
		expect(valueFor('Path to sign-up page')).toBe(
			'/global/sign-up-for-afternoon-update',
		);
		expect(
			screen
				.getByRole('link', {
					name: '/global/sign-up-for-afternoon-update',
				})
				.getAttribute('href'),
		).toBe('https://theguardian.com/global/sign-up-for-afternoon-update');
		expect(valueFor('Series tag')).toBe('news/series/afternoon-update');
		expect(valueFor('Tag description')).toBe('The afternoon news briefing');
		expect(valueFor('Campaign tag')).toBe(
			'Afternoon update (newsletter sign up)',
		);
		expect(valueFor('Campaign description')).toBe(
			'Sign up for the afternoon briefing',
		);
	});

	it.each([undefined, ''])(
		'shows "Not set" for sign-up page and tag values that are %s',
		(value) => {
			render(
				<NewsletterDetailPanels
					newsletter={newsletter({
						signupPage: value,
						seriesTag: value,
						seriesTagDescription: value,
						composerTag: value,
						composerCampaignTag: value,
					})}
				/>,
			);

			for (const label of [
				'Path to sign-up page',
				'Series tag',
				'Tag description',
				'Campaign tag',
				'Campaign description',
			]) {
				expect(valueFor(label)).toBe('Not set');
			}
			expect(panel('Sign-up page and tags').queryByRole('link')).toBeNull();
		},
	);

	it('shows braze values from the newsletter', () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					brazeCampaignCreationStatus: 'COMPLETED',
					brazeNewsletterName: 'Editorial_AfternoonUpdate',
					brazeSubscribeAttributeName: 'AfternoonUpdate_Subscribe_Email',
					brazeSubscribeEventNamePrefix: 'afternoon_update',
				})}
			/>,
		);

		screen.getByRole('region', { name: 'Braze values' });
		expect(valueFor('Braze campaign creation status')).toBe('Completed');
		expect(valueFor('brazeNewsletterName')).toBe('Editorial_AfternoonUpdate');
		expect(valueFor('brazeSubscribeAttributeName')).toBe(
			'AfternoonUpdate_Subscribe_Email',
		);
		expect(valueFor('brazeSubscribeEventNamePrefix')).toBe('afternoon_update');
		expect(valueFor('braze subscribe event name')).toBe(
			'afternoon_update_subscribe_email_date',
		);
		expect(valueFor('braze unsubscribe event name')).toBe(
			'afternoon_update_unsubscribe_email_date',
		);
	});

	it('shows multiple values for the brazeSubscribeAttributeNameAlternate if provided', () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					brazeSubscribeAttributeNameAlternate: ['a', 'b', 'c'],
				})}
			/>,
		);

		expect(valueFor('brazeSubscribeAttributeNameAlternate')).toBe('abc');
	});

	it("shows 'Not set' for an empty brazeSubscribeAttributeNameAlternate list", () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					brazeSubscribeAttributeNameAlternate: [],
				})}
			/>,
		);

		expect(valueFor('brazeSubscribeAttributeNameAlternate')).toBe('Not set');
	});
	it.each([undefined, ''])(
		'shows "Not set" for braze values that are %s',
		(value) => {
			render(
				<NewsletterDetailPanels
					newsletter={newsletter({
						brazeNewsletterName: value,
						brazeSubscribeAttributeName: value,
						brazeSubscribeEventNamePrefix: value,
					})}
				/>,
			);

			for (const label of [
				'brazeNewsletterName',
				'brazeSubscribeAttributeName',
				'brazeSubscribeEventNamePrefix',
				'braze subscribe event name',
				'braze unsubscribe event name',
			]) {
				expect(valueFor(label)).toBe('Not set');
			}
		},
	);

	it('shows ophan values from the newsletter', () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					campaignName: 'AfternoonUpdate',
					campaignCode: 'AfternoonUpdate_Email',
				})}
			/>,
		);

		screen.getByRole('region', { name: 'Ophan values' });
		expect(valueFor('Campaign name')).toBe('AfternoonUpdate');
		expect(valueFor('Campaign code')).toBe('AfternoonUpdate_Email');
	});

	it.each([undefined, ''])(
		'shows "Not set" for ophan values that are %s',
		(value) => {
			render(
				<NewsletterDetailPanels
					newsletter={newsletter({
						campaignName: value,
						campaignCode: value,
					})}
				/>,
			);

			expect(valueFor('Campaign name')).toBe('Not set');
			expect(valueFor('Campaign code')).toBe('Not set');
		},
	);
});
