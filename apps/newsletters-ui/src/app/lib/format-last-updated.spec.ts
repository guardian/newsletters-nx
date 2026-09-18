import { describe, expect, it } from 'vitest';
import { formatLastUpdated } from './format-last-updated';

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
