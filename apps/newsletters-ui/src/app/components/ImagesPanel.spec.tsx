import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import {
	defaultRenderingOptionsValues,
	isPartialNewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { allowEditing, newsletterFixture } from '../../test-utils/newsletter';
import {
	imageSrcFor,
	panel,
	valueFor,
} from '../../test-utils/newsletter-detail-page';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { ImagesPanel } from './ImagesPanel';

vi.mock('../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));
vi.mock('../api-requests/request-newsletter-edit', () => ({
	requestNewsletterEdit: vi.fn(),
}));

beforeEach(() => {
	vi.resetAllMocks();
});

const startEditing = () => {
	fireEvent.click(panel('Images').getByRole('button', { name: 'Edit' }));
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
	newsletterFixture({
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
		render(<ImagesPanel newsletter={withImages()} />);
		startEditing();

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
		render(<ImagesPanel newsletter={withImages()} />);
		startEditing();

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

	it('explains why it cannot save when a new image fails to load', () => {
		render(<ImagesPanel newsletter={withImages()} />);
		startEditing();
		fireEvent.change(imageInput('Newsletter square (1:1)'), {
			target: { value: 'https://example.com/broken.jpg' },
		});
		reportImage('Newsletter square (1:1)', 'error');

		expect(
			panel('Images').getByText(
				"Couldn't load an image from that URL. Check the link and try again.",
			),
		).toBeTruthy();
		fireEvent.click(saveButton());
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
		expect(panel('Images').getByRole('alert').textContent).toContain(
			'Unable to save changesNewsletter square (1:1) couldn’t be loaded. Check the URL and try again.',
		);
		expect(panel('Images').getByText('Editing')).toBeTruthy();

		fireEvent.change(imageInput('Newsletter square (1:1)'), {
			target: { value: 'https://example.com/fixed.jpg' },
		});
		reportImage('Newsletter square (1:1)', 'load');
		expect(panel('Images').queryByRole('alert')).toBeNull();
	});

	it('explains why it cannot save while a new image is still being checked', () => {
		render(<ImagesPanel newsletter={withImages()} />);
		startEditing();
		fireEvent.change(imageInput('Newsletter square (1:1)'), {
			target: { value: 'https://example.com/new.jpg' },
		});

		expect(panel('Images').getAllByText('Checking image…')).toHaveLength(
			imageLabels.length,
		);
		fireEvent.click(saveButton());
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
		expect(panel('Images').getByRole('alert').textContent).toContain(
			'Unable to save changesNewsletter square (1:1) is still being checked. Please wait and try again.',
		);

		reportImage('Newsletter square (1:1)', 'load');
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
		render(<ImagesPanel newsletter={original} />);
		startEditing();
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
		expect(imageSrcFor('Newsletter square (1:1)')).toBe(newSquare);
	});

	it.each([
		['illustrationCard', 'Newsletter graphic (5:3)', imageUrls.card],
		['illustrationSquare', 'Newsletter square (1:1)', imageUrls.square],
	] as const)(
		'saves %s without creating rendering options',
		async (key, label, url) => {
			const original = newsletterFixture({ category: 'fronts-based' });
			vi.mocked(requestNewsletterEdit).mockResolvedValue({
				ok: true,
				total: 1,
				data: { ...original, [key]: url },
			});
			render(<ImagesPanel newsletter={original} />);
			startEditing();
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
			expect(imageSrcFor(label)).toBe(url);
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
			const original = newsletterFixture({ category: 'fronts-based' });
			const renderingOptions = { ...defaultRenderingOptionsValues, [key]: url };
			vi.mocked(requestNewsletterEdit).mockResolvedValue({
				ok: true,
				total: 1,
				data: { ...original, renderingOptions },
			});
			render(<ImagesPanel newsletter={original} />);
			startEditing();
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
			expect(imageSrcFor(label)).toBe(url);
		},
	);
	it('unsets cleared images and removes cleared banners from the rendering options', async () => {
		const original = withImages();
		vi.mocked(requestNewsletterEdit).mockResolvedValue({
			ok: true,
			total: 1,
			data: original,
		});
		render(<ImagesPanel newsletter={original} />);
		startEditing();
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
		render(<ImagesPanel newsletter={withImages()} />);
		startEditing();
		fireEvent.change(imageInput('Main banner graphic'), {
			target: { value: 'https://example.com/discard-me.jpg' },
		});

		fireEvent.click(panel('Images').getByRole('button', { name: 'Cancel' }));
		expect(imageSrcFor('Main banner graphic')).toBe(imageUrls.mainBanner);

		startEditing();
		expect(imageInput('Main banner graphic').value).toBe(imageUrls.mainBanner);
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
	});
});

describe('ImagesPanel view mode', () => {
	it('shows the images, or "Not set" when empty', () => {
		render(
			<ImagesPanel
				newsletter={newsletterFixture({
					illustrationCard:
						'https://uploads.guim.co.uk/2025/06/30/Business_5-3.jpg',
					renderingOptions: {
						mainBannerUrl: 'https://uploads.guim.co.uk/2025/06/30/Business.jpg',
					} as NewsletterData['renderingOptions'],
				})}
			/>,
		);
		expect(imageSrcFor('Main banner graphic')).toBe(
			'https://uploads.guim.co.uk/2025/06/30/Business.jpg',
		);
		expect(
			screen
				.getByRole('group', { name: 'Main banner graphic' })
				.querySelector('img')
				?.getAttribute('src'),
		).toBe('https://uploads.guim.co.uk/2025/06/30/Business.jpg');
		expect(valueFor('Main banner graphic (mobile)')).toBe('Not set');
		expect(imageSrcFor('Newsletter graphic (5:3)')).toBe(
			'https://uploads.guim.co.uk/2025/06/30/Business_5-3.jpg',
		);
		expect(valueFor('Newsletter square (1:1)')).toBe('Not set');
	});

	it('shows a Copy image URL button instead of the URL, and copies the URL', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'clipboard', {
			value: { writeText },
			configurable: true,
		});
		render(<ImagesPanel newsletter={withImages()} />);
		expect(valueFor('Main banner graphic')).toBe('Copy image URL');
		expect(panel('Images').queryByText(imageUrls.mainBanner)).toBeNull();
		fireEvent.click(
			panel('Images').getByRole('button', {
				name: 'Copy image URL for Main banner graphic',
			}),
		);
		expect(writeText).toHaveBeenCalledWith(imageUrls.mainBanner);
		await panel('Images').findByText('Copied to clipboard');
	});
	it('shows "Not set" without a copy button when there is no image', () => {
		render(<ImagesPanel newsletter={newsletterFixture()} />);
		expect(valueFor('Main banner graphic')).toBe('Not set');
		expect(
			panel('Images').queryByRole('button', { name: /Copy image URL/ }),
		).toBeNull();
	});
});
