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

// Stamped onto records migrated from the legacy newsletters data (2000-01-01);
// not a real edit date.
export const MIGRATION_TIMESTAMP_VALUE = 946684800;

/** A record's "last updated" value, or `undefined` if there is no real edit date. */
export const deriveUpdatedTimestamp = (
	meta: MetaData | undefined,
): number | undefined => {
	const updatedTimestamp = meta?.updatedTimestamp;

	if (
		updatedTimestamp === undefined ||
		updatedTimestamp === 0 ||
		updatedTimestamp === MIGRATION_TIMESTAMP_VALUE
	) {
		return undefined;
	}

	return updatedTimestamp;
};
