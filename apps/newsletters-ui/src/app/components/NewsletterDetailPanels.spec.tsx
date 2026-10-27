import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
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
		value: vi.fn(),
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

// The text of the <dd> paired with the <dt> labelled `label`.
const valueFor = (label: string) =>
	screen.getByText(label, { exact: true, selector: 'dt' }).nextElementSibling
		?.textContent;

describe('NewsletterDetailPanels', () => {
	it('uses single-line inputs for Headline and Success message and textareas for other Copy fields', () => {
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: true,
			useJsonEditor: false,
		});
		render(<NewsletterDetailPanels newsletter={newsletter()} />);
		fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
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
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: true,
			useJsonEditor: false,
		});
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					signUpDescription: 'Required description',
					signUpEmbedDescription: 'Required embed',
				})}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
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
			vi.mocked(usePermissions).mockReturnValue({
				editEverything: true,
				useJsonEditor: false,
			});
			const original = newsletter({
				[key]: 'Remove this',
				signUpDescription: 'Description',
				signUpEmbedDescription: 'Embed',
			});
			vi.mocked(requestNewsletterEdit).mockResolvedValue({
				ok: true,
				data: { ...original, [key]: undefined },
			});
			render(<NewsletterDetailPanels newsletter={original} />);
			fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
			fireEvent.change(screen.getByRole('textbox', { name: label }), {
				target: { value: '' },
			});
			fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
			await screen.findByRole('button', { name: 'Edit' });
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
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: true,
			useJsonEditor: false,
		});
		const original = newsletter({
			signUpHeadline: 'Original',
			signUpDescription: 'Description',
			signUpEmbedDescription: 'Embed',
		});
		vi.mocked(requestNewsletterEdit).mockResolvedValue({
			ok: true,
			data: { ...original, signUpHeadline: 'Updated headline' },
		});
		render(<NewsletterDetailPanels newsletter={original} />);
		fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
		fireEvent.change(screen.getByRole('textbox', { name: 'Headline' }), {
			target: { value: 'Updated headline' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		await screen.findByRole('button', { name: 'Edit' });
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
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: true,
			useJsonEditor: false,
		});
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({ signUpHeadline: 'Original' })}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
		fireEvent.change(screen.getByRole('textbox', { name: 'Headline' }), {
			target: { value: 'Discard me' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(valueFor('Headline')).toBe('Original');
		fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
		expect(screen.getByRole('textbox', { name: 'Headline' }).value).toBe(
			'Original',
		);
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
			vi.mocked(usePermissions).mockReturnValue({
				editEverything: true,
				useJsonEditor: false,
			});
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
			fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
			fireEvent.change(screen.getByRole('textbox', { name: 'Headline' }), {
				target: { value: 'Keep this' },
			});
			fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
			const alert = await screen.findByRole('alert');
			expect(alert.textContent).toBe(expectedError);
			expect(screen.getAllByRole('alert')).toHaveLength(1);
			expect(screen.getByRole('textbox', { name: 'Headline' }).value).toBe(
				'Keep this',
			);
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
		const panel = screen
			.getByRole('heading', { name: 'Copy', level: 3 })
			.closest('section');
		if (!panel) {
			throw new Error('Expected the Copy panel to exist');
		}
		expect(within(panel).queryByRole('link')).toBeNull();
		expect(within(panel).queryByRole('textbox')).toBeNull();
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
					},
				})}
			/>,
		);
		expect(valueFor('Main banner graphic')).toBe(
			'https://uploads.guim.co.uk/2025/06/30/Business.jpg',
		);
		expect(
			screen
				.getByRole('img', { name: 'Main banner graphic thumbnail' })
				.getAttribute('src'),
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

		const panel = screen
			.getByRole('heading', { level: 3, name: 'Sign-up page and tags' })
			.closest('section');
		expect(panel).not.toBeNull();
		expect(
			within(panel!)
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
			expect(screen.queryByRole('link')).toBeNull();
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
