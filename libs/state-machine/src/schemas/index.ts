import {
	kebabCasedString,
	themeEnumSchema,
	underscoreCasedString,
} from '@newsletters-nx/newsletters-data-client';
import { z, ZodBoolean, ZodEnum, ZodNumber, ZodString } from 'zod';
import type { WizardFormData } from '../lib/types';

// TODO - move these definitions to a separate file
export const formSchemas = {
	startDraftNewsletter: z
		.object({
			name: z.string(),
		})
		.describe('Input the name for the new newsletter'),

	identityName: z
		.object({
			identityName: kebabCasedString(),
		})
		.describe('Edit the identity name if required'),

	braze: z
		.object({
			brazeSubscribeEventNamePrefix: underscoreCasedString(),
			brazeNewsletterName: underscoreCasedString(),
			brazeSubscribeAttributeName: underscoreCasedString(),
			brazeSubscribeAttributeNameAlternate: underscoreCasedString(),
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

	signUp: z
		.object({
			headline: z.string(),
			description: z.string(),
			successMessage: z.string(),
		})
		.describe('Input the Sign Up text to display to users'),
};

// TO DO - define the schemas in the library
export const getFormSchema = (
	stepId: string,
): z.ZodObject<z.ZodRawShape> | undefined => {
	if (stepId === 'createDraftNewsletter' || stepId === 'editDraftNewsletter') {
		return formSchemas.startDraftNewsletter;
	}
	const matchingEntry = Object.entries(formSchemas).find(
		([key]) => key === stepId,
	);
	return matchingEntry ? matchingEntry[1] : undefined;
};

export const getFormBlankData = (
	stepId: string,
): WizardFormData | undefined => {
	const schema = getFormSchema(stepId);
	if (!schema) {
		return undefined;
	}

	return Object.keys(schema.shape).reduce<WizardFormData>((formData, key) => {
		const zod = schema.shape[key];

		if (!zod) {
			return formData;
		}

		const mod: WizardFormData = {};

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
