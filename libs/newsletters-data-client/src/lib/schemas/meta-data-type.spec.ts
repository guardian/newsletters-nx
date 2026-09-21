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
		expect(deriveUpdatedTimestamp(makeBlankMeta())).toBeUndefined();
	});

	it('returns undefined for the legacy migration timestamp', () => {
		expect(
			deriveUpdatedTimestamp(meta(MIGRATION_TIMESTAMP_VALUE)),
		).toBeUndefined();
	});

	it('returns undefined for NaN', () => {
		expect(deriveUpdatedTimestamp(meta(NaN))).toBeUndefined();
	});

	it('returns undefined for Infinity', () => {
		expect(deriveUpdatedTimestamp(meta(Infinity))).toBeUndefined();
	});

	it('returns undefined for a negative timestamp', () => {
		expect(deriveUpdatedTimestamp(meta(-1))).toBeUndefined();
	});
});
