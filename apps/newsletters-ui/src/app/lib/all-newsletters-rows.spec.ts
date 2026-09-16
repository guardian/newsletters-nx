import type {
	DraftNewsletterData,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { describe, expect, it } from 'vitest';
import {
	draftNewsletterToRow,
	formatLastUpdated,
	formatPillarAndCategory,
	launchedNewsletterToRow,
} from './all-newsletters-rows';

const launched = (overrides: Partial<NewsletterData> = {}) =>
	({
		identityName: 'politics-weekly',
		name: 'Politics Weekly',
		category: 'article-based',
		theme: 'news',
		status: 'live',
		illustrationCircle: 'https://example.com/circle.png',
		...overrides,
	}) as NewsletterData;

describe('formatPillarAndCategory', () => {
	it.each([
		['news', 'article-based', 'News | Article based'],
		['news', 'fronts-based', 'News | Fronts based'],
		['culture', 'manual-send', 'Culture | Manual send'],
		['news', 'other', 'News | Other'],
	] as const)('renders %s/%s as "%s"', (theme, category, expected) => {
		expect(formatPillarAndCategory(theme, category)).toBe(expected);
	});

	it('omits the missing half when a draft has only one of the two', () => {
		expect(formatPillarAndCategory('sport', undefined)).toBe('Sport');
		expect(formatPillarAndCategory(undefined, 'fronts-based')).toBe(
			'Fronts based',
		);
		expect(formatPillarAndCategory(undefined, undefined)).toBe('');
	});
});

describe('formatLastUpdated', () => {
	it('formats a timestamp as a short date', () => {
		expect(formatLastUpdated(Date.UTC(2026, 2, 20, 12))).toBe('20 Mar 2026');
	});

	it('reports an unknown date when there is no timestamp', () => {
		expect(formatLastUpdated(undefined)).toBe('Unknown');
	});
});

describe('launchedNewsletterToRow', () => {
	it('maps the core row information', () => {
		const row = launchedNewsletterToRow({
			...launched(),
			meta: {
				createdTimestamp: 0,
				updatedTimestamp: Date.UTC(2026, 2, 20, 12),
				createdBy: 'a@example.com',
				updatedBy: 'a@example.com',
			},
		});

		expect(row).toMatchObject({
			id: 'launched-politics-weekly',
			kind: 'launched',
			href: '/launched/politics-weekly',
			name: 'Politics Weekly',
			theme: 'news',
			category: 'article-based',
			status: 'live',
			thumbnailUrl: 'https://example.com/circle.png',
			lastUpdated: Date.UTC(2026, 2, 20, 12),
		});
	});

	it('falls back through the illustration fields for a thumbnail', () => {
		expect(
			launchedNewsletterToRow(
				launched({
					illustrationCircle: undefined,
					illustrationSquare: 'https://example.com/square.png',
				}),
			).thumbnailUrl,
		).toBe('https://example.com/square.png');
	});

	it('has no thumbnail when the newsletter has no illustration', () => {
		expect(
			launchedNewsletterToRow(launched({ illustrationCircle: undefined }))
				.thumbnailUrl,
		).toBeUndefined();
	});

	it.each([
		['a blank meta timestamp', 0],
		['the legacy migration timestamp', 946684800],
	])('treats %s as no last-updated date', (_, updatedTimestamp) => {
		const row = launchedNewsletterToRow({
			...launched(),
			meta: {
				createdTimestamp: 0,
				updatedTimestamp,
				createdBy: 'unknown',
				updatedBy: 'unknown',
			},
		});

		expect(row.lastUpdated).toBeUndefined();
	});
});

describe('draftNewsletterToRow', () => {
	it('maps a draft to the same row shape without a status', () => {
		const draft: DraftNewsletterData = {
			name: 'Culture Manual',
			theme: 'culture',
			category: 'manual-send',
		};

		const row = draftNewsletterToRow({ ...draft, listId: 12 });

		expect(row).toMatchObject({
			id: 'draft-12',
			kind: 'draft',
			href: '/drafts/12',
			name: 'Culture Manual',
			theme: 'culture',
			category: 'manual-send',
		});
		expect(row.status).toBeUndefined();
	});

	it('names an untitled draft by its list id', () => {
		expect(draftNewsletterToRow({ listId: 7 }).name).toBe('Untitled draft 7');
	});
});
