import { z } from 'zod';

export const questionaireSchema = z.object({
	name: z.string(),
	age: z.number(),
	favouriteColor: z.string().optional(),
});

export type Questionaire = z.infer<typeof questionaireSchema>;


