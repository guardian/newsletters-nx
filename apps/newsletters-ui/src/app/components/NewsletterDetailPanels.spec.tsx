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

	it('shows "Not set" for details that are missing', () => {
		render(
			<NewsletterDetailPanels
				newsletter={newsletter({
					regionFocus: undefined,
					frequency: '',
				})}
			/>,
		);

		expect(valueFor('Region focus')).toBe('Not set');
		expect(valueFor('Frequency')).toBe('Not set');
	});
});
