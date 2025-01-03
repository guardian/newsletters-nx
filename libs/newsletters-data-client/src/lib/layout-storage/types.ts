import { z } from 'zod';

export const editionIdSchema = z.enum(['UK', 'US', 'AU', 'INT', 'EUR']);

export const editionIds = editionIdSchema.options;
export type EditionId = z.infer<typeof editionIdSchema>;

const layoutGroup = z
	.object({
		title: z.string(),
		subtitle: z.string().optional(),
		newsletters: z.string().array(),
	});

export const layoutSchema = z.object({
	groups: layoutGroup.array()
});

export type Layout = z.infer<typeof layoutSchema>;

export type EditionsLayouts = Partial<Record<EditionId, Layout>>;
