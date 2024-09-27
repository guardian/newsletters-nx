import { z } from 'zod';

export const editionIdSchema = z.enum(['UK', 'US', 'AU', 'INT', 'EUR']);

export const editionIds = editionIdSchema.options;
export type EditionId = z.infer<typeof editionIdSchema>;

export const layoutSchema = z
	.object({
		title: z.string(),
		subtitle: z.string().optional(),
		newsletters: z.string().array(),
	})
	.array();

export type Layout = z.infer<typeof layoutSchema>;

export type EditionsLayouts = Partial<Record<EditionId, Layout>>;
