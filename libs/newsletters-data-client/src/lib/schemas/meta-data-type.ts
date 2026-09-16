import { z } from 'zod';
import type { UserProfile } from '../user-profile';

export const metaDataSchema = z.object({
	createdTimestamp: z.number(),
	updatedTimestamp: z.number(),
	launchTimestamp: z.number().optional(),
	createdBy: z.string(),
	updatedBy: z.string(),
	launchedBy: z.string().optional(),
});

export type MetaData = z.infer<typeof metaDataSchema>;

export const createNewMeta = (user: UserProfile): MetaData => {
	const now = Date.now();
	return {
		createdTimestamp: now,
		createdBy: user.email ?? '[unknown]',
		updatedTimestamp: now,
		updatedBy: user.email ?? '[unknown]',
	};
};

export const updateMeta = (
	meta: MetaData,
	user: UserProfile,
	isLaunch = false,
): MetaData => {
	const now = Date.now();

	if (isLaunch) {
		return {
			...meta,
			updatedTimestamp: now,
			updatedBy: user.email ?? '[unknown]',
			launchTimestamp: now,
			launchedBy: user.email ?? '[unknown]',
		};
	}

	return {
		...meta,
		updatedTimestamp: now,
		updatedBy: user.email ?? '[unknown]',
	};
};

export const makeBlankMeta = (): MetaData => ({
	createdTimestamp: 0,
	createdBy: 'unknown',
	updatedTimestamp: 0,
	updatedBy: 'unknown',
});

/**
 * The timestamp (2000-01-01) stamped onto records brought over by the
 * migration from the legacy newsletters data. It records when the data was
 * migrated, not when anybody edited the newsletter through this app, so it is
 * displayed as "unknown" rather than as a date.
 */
export const MIGRATION_TIMESTAMP_VALUE = 946684800;

/**
 * The "last updated" value to display for a record: the last time it was
 * written through this app, or `undefined` when there is no real edit date.
 *
 * `0` is reachable because both storage implementations fall back to
 * `makeBlankMeta()` when updating a record that has no meta, and
 * `MIGRATION_TIMESTAMP_VALUE` only records when a legacy record was migrated.
 * Neither is a real edit date, so both are reported as "no value" rather than
 * rendering as 1 Jan 1970 or 1 Jan 2000.
 */
export const deriveUpdatedTimestamp = (
	meta: MetaData | undefined,
): number | undefined => {
	const updatedTimestamp = meta?.updatedTimestamp;

	if (
		typeof updatedTimestamp !== 'number' ||
		!Number.isFinite(updatedTimestamp) ||
		updatedTimestamp <= 0 ||
		updatedTimestamp === MIGRATION_TIMESTAMP_VALUE
	) {
		return undefined;
	}

	return updatedTimestamp;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const SEED_EDITORS = [
	'ada.lovelace@example.com',
	'grace.hopper@example.com',
	'alan.turing@example.com',
];

/**
 * Plausible meta data for records seeded into the in-memory stores used by
 * local dev and tests, where nothing has ever been written through the app.
 *
 * `makeBlankMeta()` would leave every row with no last-updated date, so the
 * values here are spread out relative to "now" — deterministic for a given
 * `index` and `now`, but varied enough to be meaningful to look at.
 */
export const makeSeedMeta = (index: number, now = Date.now()): MetaData => {
	const createdDaysAgo = 120 + ((index * 23) % 600);
	const updatedDaysAgo = (index * 11) % 60;
	const createdBy = SEED_EDITORS[index % SEED_EDITORS.length] as string;
	const updatedBy = SEED_EDITORS[(index + 1) % SEED_EDITORS.length] as string;

	return {
		createdTimestamp: now - createdDaysAgo * DAY_IN_MS,
		createdBy,
		updatedTimestamp: now - updatedDaysAgo * DAY_IN_MS,
		updatedBy,
	};
};
