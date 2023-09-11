import { z } from 'zod';

export interface Override {
	userId: string;
	active: boolean;
}

export interface Permission {
	permission: {
		name: string;
		app: string;
	};
	overrides: Override[];
}

const permissonSchema = z.object({
	permission: z.object({
		name: z.string(),
		app: z.string(),
	}),
	overrides: z.array(
		z.object({
			userId: z.string(),
			active: z.boolean(),
		}),
	),
});

export const permissionsArraySchema = z.array(permissonSchema);
