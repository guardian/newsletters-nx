import { z } from 'zod';
import {
	kebabCasedString,
	themeEnumSchema,
	underscoreCasedString,
} from '@newsletters-nx/newsletters-data-client';

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

	description: z
		.object({
			description: z.string(),
		})
		.describe('Input a short description to display to users'),

	designLink: z
		.object({
			designUrl: z.string().url().optional(),
		})
		.describe('enter the link to the design page'),
};
