import type { ZodObject, ZodRawShape } from 'zod';
import { z } from 'zod';
import type { RenderingOptions } from '@newsletters-nx/newsletters-data-client';
import {
	newsletterDataSchema,
	onlineArticleSchema,
	renderingOptionsSchema,
	singleThrasherLocation,
} from '@newsletters-nx/newsletters-data-client';

const pickAndPrefixRenderingOption = (
	fieldKeys: Array<keyof RenderingOptions>,
): ZodObject<ZodRawShape> => {
	const shape: ZodRawShape = {};
	fieldKeys.forEach((key) => {
		shape[`renderingOptions.${key}`] = renderingOptionsSchema.shape[key];
	});
	return z.object(shape);
};

export const formSchemas = {
	startDraftNewsletter: newsletterDataSchema
		.pick({ name: true })
		.describe('Input the name for the new newsletter'),

	identityName: newsletterDataSchema
		.pick({ identityName: true })
		.describe('Edit the identity name if required'),

	braze: newsletterDataSchema
		.pick({
			brazeSubscribeEventNamePrefix: true,
			brazeNewsletterName: true,
			brazeSubscribeAttributeName: true,
			brazeSubscribeAttributeNameAlternate: true,
		})
		.describe('Edit the Braze values if required'),

	ophan: newsletterDataSchema
		.pick({
			campaignName: true,
			campaignCode: true,
		})
		.describe('Edit the Ophan values if required'),

	pillar: newsletterDataSchema
		.pick({
			theme: true,
		})
		.describe('Choose a theme'),

	signUp: z
		.object({
			headline: z.string(),
			description: z.string(),
		})
		.describe('Input the Sign Up page copy'),

	regionFocus: newsletterDataSchema
		.pick({
			regionFocus: true,
		})
		.describe('Select from the drop-down list'),

	designBrief: z
		.object({
			designBriefDoc: z.string(),
			figmaDesignUrl: z.string().url().optional(),
			figmaIncludesThrashers: z.boolean(),
		})
		.describe('Input the design brief and Figma design'),

	newsletterHeader: pickAndPrefixRenderingOption([
		'displayDate',
		'displayStandfirst',
	]).describe('Input the header setup'),

	footer: pickAndPrefixRenderingOption(['contactEmail']).describe(
		'Input the footer setup',
	),

	frequency: newsletterDataSchema
		.pick({
			frequency: true,
		})
		.describe('Input the send frequency'),

	images: pickAndPrefixRenderingOption(['displayImageCaptions']).describe(
		'Specify the image setup',
	),

	onlineArticle: z
		.object({
			onlineArticle: onlineArticleSchema,
		})
		.describe('Select from the drop-down list'),

	linkList: pickAndPrefixRenderingOption(['linkListSubheading']).describe(
		'Input the subheading triggers',
	),

	podcast: pickAndPrefixRenderingOption(['podcastSubheading']).describe(
		'Input the subheading triggers',
	),

	readMore: pickAndPrefixRenderingOption([
		'readMoreSubheading',
		'readMoreWording',
		'readMoreUrl',
	]).describe('Input the Read More setup'),

	tags: z
		.object({
			seriesTag: z.string(),
			composerTag: z.string().optional(),
			composerCampaignTag: z.string().optional(),
		})
		.describe('Input the tag setup'),

	thrasher: z
		.object({
			singleThrasher: z.boolean(),
			multiThrasher: z.boolean(),
			singleThrasherLocation: singleThrasherLocation,
			thrasherDescription: z.string(),
		})
		.describe('Input the thrasher setup'),

	promotionDates: z
		.object({
			signUpPageDate: z.coerce.date(),
			thrasherDate: z.coerce.date(),
		})
		.describe('choose the dates you want promotions to appear'),
};
