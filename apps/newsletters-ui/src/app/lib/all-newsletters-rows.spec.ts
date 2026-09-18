import type {
	DraftWithIdAndMeta,
	MetaData,
	NewsletterDataWithMeta,
} from '@newsletters-nx/newsletters-data-client';
import {
	makeBlankMeta,
	MIGRATION_TIMESTAMP_VALUE,
} from '@newsletters-nx/newsletters-data-client';
import { describe, expect, it } from 'vitest';
import {
	draftNewsletterToRow,
	formatPillarCategoryLabel,
	launchedNewsletterToRow,
} from './all-newsletters-rows';

const UPDATED = Date.UTC(2026, 2, 20, 12);

const meta = (overrides: Partial<MetaData> = {}): MetaData => ({
	createdTimestamp: Date.UTC(2025, 0, 1),
	createdBy: 'a@example.com',
	updatedTimestamp: UPDATED,
	updatedBy: 'b@example.com',
	...overrides,
});

const launched = (
	overrides: Partial<NewsletterDataWithMeta> = {},
): NewsletterDataWithMeta =>
	({
		identityName: 'politics-weekly',
		name: 'Politics Weekly',
		category: 'article-based',
		theme: 'news',
		status: 'live',
		illustrationSquare: 'https://example.com/square.png',
		meta: meta(),
		...overrides,
	}) as NewsletterDataWithMeta;

const draft = (overrides: Partial<DraftWithIdAndMeta> = {}) =>
	({
		listId: 12,
		name: 'Culture Manual',
		theme: 'culture',
		category: 'manual-send',
		meta: meta(),
		...overrides,
	}) as DraftWithIdAndMeta;

describe('launchedNewsletterToRow', () => {
	it('maps the core row information', () => {
		expect(launchedNewsletterToRow(launched())).toEqual({
			id: 'launched-politics-weekly',
			kind: 'launched',
			href: '/launched/politics-weekly',
			name: 'Politics Weekly',
			theme: 'news',
			category: 'article-based',
			statusBadge: { label: 'Live', color: 'green' },
			thumbnailUrl: 'https://example.com/square.png',
			lastUpdated: UPDATED,
		});
	});

	it.each([
		[
			'prefers illustrationSquare over circle and card',
			{
				illustrationCircle: 'https://example.com/circle.png',
				illustrationCard: 'https://example.com/card.png',
			},
			'https://example.com/square.png',
		],
		[
			'falls back to illustrationCircle when square is absent',
			{
				illustrationSquare: undefined,
				illustrationCircle: 'https://example.com/circle.png',
			},
			'https://example.com/circle.png',
		],
		[
			'treats an empty illustrationSquare as absent',
			{
				illustrationSquare: '',
				illustrationCircle: 'https://example.com/circle.png',
			},
			'https://example.com/circle.png',
		],
		[
			'falls back to illustrationCard',
			{
				illustrationSquare: undefined,
				illustrationCircle: undefined,
				illustrationCard: 'https://example.com/card.png',
			},
			'https://example.com/card.png',
		],
		[
			'is undefined with no illustration',
			{ illustrationSquare: undefined },
			undefined,
		],
	])('%s', (_, overrides, expected) => {
		expect(launchedNewsletterToRow(launched(overrides)).thumbnailUrl).toBe(
			expected,
		);
	});

	it.each([
		['a blank meta', makeBlankMeta()],
		[
			'the legacy migration timestamp',
			meta({ updatedTimestamp: MIGRATION_TIMESTAMP_VALUE }),
		],
	])('reports no last-updated date for %s', (_, metaData) => {
		expect(
			launchedNewsletterToRow(launched({ meta: metaData })).lastUpdated,
		).toBeUndefined();
	});
});

describe('draftNewsletterToRow', () => {
	it('maps a draft to the same row shape', () => {
		const row = draftNewsletterToRow(draft());

		// `statusBadge.label` depends on `calculateProgress`'s own field-count
		// logic (covered by that function's own tests), so only its shape is
		// asserted here, not a specific percentage.
		expect(row).toMatchObject({
			id: 'draft-12',
			kind: 'draft',
			href: '/drafts/12',
			name: 'Culture Manual',
			theme: 'culture',
			category: 'manual-send',
			thumbnailUrl: undefined,
			lastUpdated: UPDATED,
		});
		expect(row.statusBadge.label).toMatch(/^Draft • \d+%$/);
		expect(row.statusBadge.color).toBe('yellow');
	});

	it('names an untitled draft by its list id', () => {
		expect(draftNewsletterToRow(draft({ name: undefined })).name).toBe(
			'Untitled draft 12',
		);
	});

	it.each([
		['a blank meta', makeBlankMeta()],
		[
			'the legacy migration timestamp',
			meta({ updatedTimestamp: MIGRATION_TIMESTAMP_VALUE }),
		],
	])('reports no last-updated date for %s', (_, metaData) => {
		expect(
			draftNewsletterToRow(draft({ meta: metaData })).lastUpdated,
		).toBeUndefined();
	});
});

describe('formatPillarCategoryLabel', () => {
	it.each([
		[
			'both theme and category',
			'news',
			'article-based',
			'News | Article based',
		],
		['only theme', 'news', undefined, 'News'],
		['neither', undefined, undefined, undefined],
	] as const)('%s', (_, theme, category, expected) => {
		expect(formatPillarCategoryLabel(theme, category)).toBe(expected);
	});
});
