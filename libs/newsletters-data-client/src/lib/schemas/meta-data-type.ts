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

export const stripMeta = <T extends Partial<Record<string, unknown>>>(
	data: T,
) => {
	return {
		...data,
		meta: undefined,
	};
};

export const makeBlankMeta = (): MetaData => ({
	createdTimestamp: 0,
	createdBy: 'unknown',
	updatedTimestamp: 0,
	updatedBy: 'unknown',
});
