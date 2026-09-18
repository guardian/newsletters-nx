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
 * migrated, not when anybody edited the newsletter through this app.
 */
export const MIGRATION_TIMESTAMP_VALUE = 946684800;

/**
 * The "last updated" value to display for a record: the last time it was
 * written through this app, or `undefined` when there is no real edit date.
 *
 * `0` is reachable because a record stored before `meta` existed is defaulted
 * to `makeBlankMeta()` on read, and `MIGRATION_TIMESTAMP_VALUE` only records
 * when a legacy record was migrated. Neither is a real edit date, so both are
 * reported as "no value" rather than rendering as 1 Jan 1970 or 1 Jan 2000.
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
