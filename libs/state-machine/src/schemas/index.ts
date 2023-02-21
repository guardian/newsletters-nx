import { themeEnumSchema } from '@newsletters-nx/newsletters-data-client';
import { ZodBoolean, ZodEnum, ZodNumber, ZodString, z } from 'zod';

type FormData = Record<string, string | number | boolean | undefined>;

export const formSchemas = {
	createNewsletter: z
		.object({
			name: z.string(),
		})
		.describe('Input the name for createNewsletter'),

	pillar: z
		.object({
			theme: themeEnumSchema,
		})
		.describe('Choose a theme'),
};

// TO DO - define the schemas in the library
export const getFormSchema = (
	stepId: string,
): z.ZodObject<z.ZodRawShape> | undefined => {
	if (stepId === 'createNewsletter') {
		return formSchemas.createNewsletter;
	}
	if (stepId === 'pillar') {
		return formSchemas.pillar;
	}

	return undefined;
};

export const getFormBlankData = (stepId: string): FormData | undefined => {
	const schema = getFormSchema(stepId);
	if (!schema) {
		return undefined;
	}

	return Object.keys(schema.shape).reduce<FormData>((formData, key) => {
		const zod = schema.shape[key];

		if (!zod) {
			return formData;
		}

		const mod: FormData = {};

		if (zod instanceof ZodString) {
			mod[key] = '';
		} else if (zod instanceof ZodEnum<[string]>) {
			const [firstOption] = zod.options;
			mod[key] = firstOption as string;
		} else if (zod instanceof ZodNumber) {
			mod[key] = 0;
		} else if (zod instanceof ZodBoolean) {
			mod[key] = false;
		}

		return {
			...formData,
			...mod,
		};
	}, {});
};
