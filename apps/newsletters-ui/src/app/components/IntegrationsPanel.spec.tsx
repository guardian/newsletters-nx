import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IntegrationsPanel } from './IntegrationsPanel';

afterEach(() => {
	cleanup();
});

vi.mock('../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));
beforeEach(() => {
	vi.resetAllMocks();
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

describe('IntegrationsPanel', () => {
	it('shows braze values from the newsletter', () => {
		render(
			<IntegrationsPanel
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
			<IntegrationsPanel
				newsletter={newsletter({
					brazeSubscribeAttributeNameAlternate: ['a', 'b', 'c'],
				})}
			/>,
		);

		expect(valueFor('brazeSubscribeAttributeNameAlternate')).toBe('abc');
	});

	it("shows 'Not set' for an empty brazeSubscribeAttributeNameAlternate list", () => {
		render(
			<IntegrationsPanel
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
				<IntegrationsPanel
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
			<IntegrationsPanel
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
				<IntegrationsPanel
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
