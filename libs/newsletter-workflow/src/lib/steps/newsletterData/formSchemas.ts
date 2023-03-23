import type { ZodObject, ZodRawShape } from 'zod';
import { z } from 'zod';
import type { RenderingOptions } from '@newsletters-nx/newsletters-data-client';
import {
	newsletterDataSchema,
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

	signUp: newsletterDataSchema
		.pick({
			headline: true,
			description: true,
		})
		.describe('Input the Sign Up page copy'),

	regionFocus: newsletterDataSchema
		.pick({
			regionFocus: true,
		})
		.describe('Select from the drop-down list'),

	designBrief: newsletterDataSchema
		.pick({
			designBriefDoc: true,
			figmaDesignUrl: true,
			figmaIncludesThrashers: true,
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

	onlineArticle: newsletterDataSchema
		.pick({
			onlineArticle: true,
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

	tags: newsletterDataSchema
		.pick({
			seriesTag: true,
			composerTag: true,
			composerCampaignTag: true,
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

	promotionDates: newsletterDataSchema
		.pick({
			signUpPageDate: true,
			thrasherDate: true,
		})
		.describe('choose the dates you want promotions to appear'),
};
