import { z } from 'zod';

export const metaDataSchema = z.object({
	createdTimestamp: z.number(),
	updatedTimestamp: z.number(),
	createdBy: z.string(),
	updatedBy: z.string(),
});

export type MetaData = z.infer<typeof metaDataSchema>;
