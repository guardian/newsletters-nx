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
	screen.getByText(label, { exact: true, selector: 'dt' }).nextElementSibling
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
		expect(valueFor('Main banner graphic (mobile)')).toBe('Not set');
		expect(valueFor('Newsletter graphic (5:3)')).toBe(
			'https://uploads.guim.co.uk/2025/06/30/Business_5-3.jpg',
		);
		expect(valueFor('Newsletter square (1:1)')).toBe('Not set');
	});
});
