import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { scrollIntoView } from '../../test-utils/dom';
import { allowEditing, newsletterFixture } from '../../test-utils/newsletter';
import { panel, valueFor } from '../../test-utils/newsletter-detail-page';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { DraftDetailPanels, NewsletterDetailPanels } from './NewsletterDetailPanels';

vi.mock('../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));
vi.mock('../api-requests/request-newsletter-edit', () => ({
	requestNewsletterEdit: vi.fn(),
}));

beforeEach(() => {
	vi.resetAllMocks();
});

const startEditing = (panelName: string) => {
	fireEvent.click(panel(panelName).getByRole('button', { name: 'Edit' }));
};

describe('Jump to', () => {
	afterEach(() => {
		window.history.replaceState(null, '', '/');
	});

	it('links to every panel on the page', () => {
		render(<NewsletterDetailPanels newsletter={newsletterFixture()} />);
		const links = within(
			screen.getByRole('navigation', { name: 'Jump to' }),
		).getAllByRole('link');

		expect(links.map((link) => link.textContent)).toEqual([
			'Attributes',
			'Images',
			'Copy',
			'Sign-up page and tags',
			'Integrations',
			'Technical output',
		]);
		for (const link of links) {
			const id = link.getAttribute('href')?.split('#')[1];
			expect(document.getElementById(id ?? '')).toBeTruthy();
		}
	});

	it('omits technical output from draft panels and their navigation', () => {
		render(<DraftDetailPanels draft={{ identityName: 'example' }} />);

		const names = [
			'Attributes',
			'Launch',
			'Images',
			'Copy',
			'Sign-up page and tags',
			'Integrations',
		];
		expect(
			screen
				.getAllByRole('heading', { level: 3 })
				.map((heading) => heading.textContent),
		).toEqual(names);
		const links = within(
			screen.getByRole('navigation', { name: 'Jump to' }),
		).getAllByRole('link');
		expect(links.map((link) => link.textContent)).toEqual(names);
		for (const link of links) {
			const id = link.getAttribute('href')?.split('#')[1];
			expect(document.getElementById(id ?? '')).toBeTruthy();
		}
		expect(document.getElementById('technical-output')).toBeNull();
	});

	it('links stay on the current page rather than the base URL', () => {
		window.history.replaceState(
			null,
			'',
			'/newsletters/afternoon-update/details',
		);
		render(<NewsletterDetailPanels newsletter={newsletterFixture()} />);

		expect(
			screen.getByRole('link', { name: 'Attributes' }).getAttribute('href'),
		).toBe('/newsletters/afternoon-update/details#attributes');
	});

	it('replaces the history entry, scrolls and moves focus when a link is clicked', () => {
		render(<NewsletterDetailPanels newsletter={newsletterFixture()} />);
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
		render(<NewsletterDetailPanels newsletter={newsletterFixture()} />);

		expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: 'start' });
		expect(scrollIntoView.mock.contexts[0]).toBe(
			document.getElementById('integrations'),
		);
	});

	it('does not scroll when the address has no panel', () => {
		render(<NewsletterDetailPanels newsletter={newsletterFixture()} />);

		expect(scrollIntoView).not.toHaveBeenCalled();
	});
});

describe('NewsletterDetailPanels', () => {
	it('uses single-line inputs for Headline and Success message and textareas for other Copy fields', () => {
		allowEditing();
		render(<NewsletterDetailPanels newsletter={newsletterFixture()} />);
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
				newsletter={newsletterFixture({
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
			const original = newsletterFixture({
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
		const original = newsletterFixture({
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
				newsletter={newsletterFixture({ signUpHeadline: 'Original' })}
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
					newsletter={newsletterFixture({
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
			expect(alert.textContent).toContain(
				`Unable to save changes${expectedError}`,
			);
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
				newsletter={newsletterFixture({
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
			'Technical output',
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
					newsletter={newsletterFixture({
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

	it('shows the attributes', () => {
		render(<NewsletterDetailPanels newsletter={newsletterFixture()} />);

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
				newsletter={newsletterFixture({
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
});
