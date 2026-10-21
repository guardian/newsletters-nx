import { describe, expect, it } from 'vitest';
import {
	formatLastUpdated,
	formatPillarCategoryLabel,
	formatShortDate,
	humanize,
} from './format';

describe('formatShortDate', () => {
	it('formats a date as "DD MMMM YY"', () => {
		// Midday UTC, so the date is the same in any test timezone.
		expect(formatShortDate('2026-06-01T12:00:00.000Z')).toBe('01 June 26');
	});

	it('returns undefined when there is no date', () => {
		expect(formatShortDate(undefined)).toBeUndefined();
	});

	// z.coerce.date() turns a stored null/0 into the 1970 epoch.
	it('returns undefined for the 1970 epoch', () => {
		expect(formatShortDate(new Date(0))).toBeUndefined();
	});
});

describe('humanize', () => {
	it.each([
		['news', 'News'],
		['article-based', 'Article based'],
		['article-based-legacy', 'Article based legacy'],
	])('turns "%s" into "%s"', (value, expected) => {
		expect(humanize(value)).toBe(expected);
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

describe('formatLastUpdated', () => {
	it('formats a timestamp as a date string', () => {
		expect(formatLastUpdated(Date.UTC(2026, 2, 20, 12))).toBe(
			new Date(Date.UTC(2026, 2, 20, 12)).toDateString(),
		);
	});

	it('reports "Unknown" when there is no timestamp', () => {
		expect(formatLastUpdated(undefined)).toBe('Unknown');
	});
});
