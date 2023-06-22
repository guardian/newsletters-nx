import { z } from 'zod';
import type { UserProfile } from './user-profile';

export const metaDataSchema = z.object({
	createdTimestamp: z.number(),
	updatedTimestamp: z.number(),
	createdBy: z.string(),
	updatedBy: z.string(),
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

export const updateMeta = (meta: MetaData, user: UserProfile): MetaData => {
	const now = Date.now();
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
