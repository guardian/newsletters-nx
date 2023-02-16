import { z } from 'zod';

export const personSchema = z.object({
	name: z.string(),
	age: z.number(),
	favouriteColor: z.string().optional(),
});

export type Person = z.infer<typeof personSchema>;

export const biscuitSchema = z.object({
	name: z.string(),
	shape: z.enum(['round', 'finger', 'star', 'rectangle']),
	filling: z.enum(['none', 'jam', 'chocolate']),
	sugarOnTop: z.boolean(),
});

export type Biscuit = z.infer<typeof biscuitSchema>;
