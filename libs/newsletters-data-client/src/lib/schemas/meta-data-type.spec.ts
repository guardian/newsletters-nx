import {
	deriveUpdatedTimestamp,
	makeBlankMeta,
	makeSeedMeta,
	MIGRATION_TIMESTAMP_VALUE,
} from './meta-data-type';

describe('makeSeedMeta', () => {
	const now = 1_750_000_000_000;

	it('produces a usable last-updated date, unlike makeBlankMeta', () => {
		expect(makeSeedMeta(0, now).updatedTimestamp).toBeGreaterThan(0);
		expect(makeBlankMeta().updatedTimestamp).toBe(0);
	});

	it('varies the values between records', () => {
		const timestamps = [0, 1, 2, 3, 4].map(
			(index) => makeSeedMeta(index, now).updatedTimestamp,
		);

		expect(new Set(timestamps).size).toBe(timestamps.length);
	});

	it('is deterministic for a given index and time', () => {
		expect(makeSeedMeta(3, now)).toEqual(makeSeedMeta(3, now));
	});

	it('records an update at or after creation, and never in the future', () => {
		[0, 1, 2, 3, 4, 5].forEach((index) => {
			const meta = makeSeedMeta(index, now);
			expect(meta.updatedTimestamp).toBeGreaterThanOrEqual(
				meta.createdTimestamp,
			);
			expect(meta.updatedTimestamp).toBeLessThanOrEqual(now);
		});
	});

	it('never produces the migration sentinel', () => {
		[0, 1, 2, 3, 4, 5].forEach((index) => {
			expect(makeSeedMeta(index, now).updatedTimestamp).not.toBe(
				MIGRATION_TIMESTAMP_VALUE,
			);
		});
	});
});

describe('deriveUpdatedTimestamp', () => {
	const meta = makeSeedMeta(0, 1_750_000_000_000);

	it('returns the updatedTimestamp when it is a real edit date', () => {
		expect(deriveUpdatedTimestamp(meta)).toBe(meta.updatedTimestamp);
	});

	it('returns undefined when there is no meta at all', () => {
		expect(deriveUpdatedTimestamp(undefined)).toBeUndefined();
	});

	it('returns undefined for the blank meta used when a record has none', () => {
		expect(deriveUpdatedTimestamp(makeBlankMeta())).toBeUndefined();
	});

	it('returns undefined for the migration sentinel, which is not a real edit', () => {
		expect(
			deriveUpdatedTimestamp({
				...meta,
				updatedTimestamp: MIGRATION_TIMESTAMP_VALUE,
			}),
		).toBeUndefined();
	});

	it.each([0, -1, NaN, Infinity])(
		'returns undefined for the unusable value %p',
		(updatedTimestamp) => {
			expect(
				deriveUpdatedTimestamp({ ...meta, updatedTimestamp }),
			).toBeUndefined();
		},
	);
});
