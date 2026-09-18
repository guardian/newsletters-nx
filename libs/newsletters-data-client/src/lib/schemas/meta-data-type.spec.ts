import {
	deriveUpdatedTimestamp,
	makeBlankMeta,
	MIGRATION_TIMESTAMP_VALUE,
} from './meta-data-type';
import type { MetaData } from './meta-data-type';

const meta = (updatedTimestamp: number): MetaData => ({
	...makeBlankMeta(),
	updatedTimestamp,
});

describe('deriveUpdatedTimestamp', () => {
	it('returns a real edit timestamp unchanged', () => {
		const updatedTimestamp = Date.UTC(2026, 2, 20, 12);
		expect(deriveUpdatedTimestamp(meta(updatedTimestamp))).toBe(
			updatedTimestamp,
		);
	});

	it('returns undefined when there is no meta at all', () => {
		expect(deriveUpdatedTimestamp(undefined)).toBeUndefined();
	});

	it('returns undefined for a blank meta', () => {
		// Records stored before meta existed are defaulted to a blank meta on
		// read, so its zero timestamp must not render as 1 Jan 1970.
		expect(deriveUpdatedTimestamp(makeBlankMeta())).toBeUndefined();
	});

	it('returns undefined for the legacy migration timestamp', () => {
		// That records when the legacy data was migrated, not when anybody
		// edited the newsletter.
		expect(
			deriveUpdatedTimestamp(meta(MIGRATION_TIMESTAMP_VALUE)),
		).toBeUndefined();
	});

	it.each([
		['a negative timestamp', -1],
		['NaN', NaN],
		['Infinity', Infinity],
	])('returns undefined for %s', (_, updatedTimestamp) => {
		expect(deriveUpdatedTimestamp(meta(updatedTimestamp))).toBeUndefined();
	});
});
