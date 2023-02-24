import { themeEnumSchema } from '@newsletters-nx/newsletters-data-client';
import { z, ZodBoolean, ZodEnum, ZodNumber, ZodString } from 'zod';

type FormData = Record<string, string | number | boolean | undefined>;

// TODO - move these definitions to a separate file
export const formSchemas = {
	createNewsletter: z
		.object({
			name: z.string(),
		})
		.describe('Input the name for the new newsletter'),

	calculatedFields: z
		.object({
			identityName: z.string(),
			brazeSubscribeEventNamePrefix: z.string(),
			brazeNewsletterName: z.string(),
			brazeSubscribeAttributeName: z.string(),
			brazeSubscribeAttributeNameAlternate: z.string(),
			campaignName: z.string(),
			campaignCode: z.string(),
		})
		.describe('Edit the calculated fields if required'),

	pillar: z
		.object({
			theme: themeEnumSchema,
		})
		.describe('Choose a theme'),

	description: z
		.object({
			description: z.string(),
		})
		.describe('Input a short description to display to users'),
};

// TO DO - define the schemas in the library
export const getFormSchema = (
	stepId: string,
): z.ZodObject<z.ZodRawShape> | undefined => {
	if (stepId === 'createNewsletter') {
		return formSchemas.createNewsletter;
	}
	if (stepId === 'calculatedFields') {
		return formSchemas.calculatedFields;
	}
	if (stepId === 'pillar') {
		return formSchemas.pillar;
	}
	if (stepId === 'description') {
		return formSchemas.description;
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
		} else if (zod instanceof ZodEnum) {
			const [firstOption] = zod.options as string[];
			mod[key] = firstOption;
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
