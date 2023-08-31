import { z } from 'zod';

export const themeEnumSchema = z.enum([
	'news',
	'opinion',
	'culture',
	'sport',
	'lifestyle',
	'features',
]);

export type Theme = z.infer<typeof themeEnumSchema>;
