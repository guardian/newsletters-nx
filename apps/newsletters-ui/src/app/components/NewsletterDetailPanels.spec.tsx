import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { cleanup, render, screen } from '@testing-library/react';
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
		// Dates are saved as midnight UTC (see `DateInput`).
		launchDate: new Date('2026-06-01T00:00:00.000Z'),
		signUpPageDate: new Date('2026-07-15T00:00:00.000Z'),
		privateUntilLaunch: false,
		...overrides,
	}) as NewsletterData;

// The text of the <dd> paired with the <dt> labelled `label`.
const valueFor = (label: string) =>
	screen
		.getAllByText(label, { exact: true })
		.find((element) => element.tagName === 'DT')?.nextElementSibling
		?.textContent;

describe('NewsletterDetailPanels', () => {
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

	it('shows the launch details', () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({ privateUntilLaunch: true })}
			/>,
		);

		expect(valueFor('Launch date')).toBe('01 June 26');
		expect(valueFor('Promotion date')).toBe('15 July 26');
		expect(valueFor('Private until launch')).toBe('Yes');
	});

	it('shows "Not set" for details that are missing', () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					regionFocus: undefined,
					frequency: '',
					launchDate: undefined,
					privateUntilLaunch: undefined,
				})}
			/>,
		);

		expect(valueFor('Region focus')).toBe('Not set');
		expect(valueFor('Frequency')).toBe('Not set');
		expect(valueFor('Launch date')).toBe('Not set');
		expect(valueFor('Private until launch')).toBe('Not set');
	});

	it('shows "No" when not private until launch', () => {
		render(<NewsletterDetailPanels newsletter={newsletter()} />);

		expect(valueFor('Private until launch')).toBe('No');
	});
});
