import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { NewsletterDetailPanels } from './NewsletterDetailPanels';

afterEach(cleanup);

const newsletter = (overrides: Partial<NewsletterData> = {}) =>
	({
		name: 'Afternoon update',
		status: 'live',
		theme: 'news',
		category: 'article-based',
		regionFocus: 'AU',
		frequency: 'Weekly',
		group: 'News in depth',
		signupPageCreationStatus: 'NOT_REQUESTED',
		tagCreationStatus: 'NOT_REQUESTED',
		...overrides,
	}) as NewsletterData;

// The text of the <dd> paired with the <dt> labelled `label`.
const valueFor = (label: string) =>
	screen.getByText(label, { exact: true, selector: 'dt' }).nextElementSibling
		?.textContent;

describe('NewsletterDetailPanels', () => {
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
		).toEqual(['Attributes', 'Images', 'Copy', 'Sign-up page and tags']);
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
});
