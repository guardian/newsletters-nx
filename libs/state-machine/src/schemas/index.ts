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

	identityName: z
		.object({
			identityName: z.string(),
		})
		.describe('Edit the identity name if required'),

	braze: z
		.object({
			brazeSubscribeEventNamePrefix: z.string(),
			brazeNewsletterName: z.string(),
			brazeSubscribeAttributeName: z.string(),
			brazeSubscribeAttributeNameAlternate: z.string(),
		})
		.describe('Edit the Braze values if required'),

	ophan: z
		.object({
			campaignName: z.string(),
			campaignCode: z.string(),
		})
		.describe('Edit the Ophan values if required'),

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
	const matchingEntry = Object.entries(formSchemas).find(
		([key]) => key === stepId,
	);
	return matchingEntry ? matchingEntry[1] : undefined;
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
