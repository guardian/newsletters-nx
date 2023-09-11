import { z } from 'zod';

export const themeEnumSchema = z
	.enum(['news', 'opinion', 'culture', 'sport', 'lifestyle', 'features'])
	.describe('pillar');

export type Theme = z.infer<typeof themeEnumSchema>;
