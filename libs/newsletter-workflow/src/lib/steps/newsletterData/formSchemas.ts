import type { ZodObject, ZodRawShape } from 'zod';
import { z } from 'zod';
import type {
	RenderingOptions,
	ThrasherOptions,
} from '@newsletters-nx/newsletters-data-client';
import {
	newsletterDataSchema,
	renderingOptionsSchema,
	thrasherOptionsSchema,
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

const pickAndPrefixThrasherOption = (
	fieldKeys: Array<keyof ThrasherOptions>,
): ZodObject<ZodRawShape> => {
	const shape: ZodRawShape = {};
	fieldKeys.forEach((key) => {
		shape[`thrasherOptions.${key}`] = thrasherOptionsSchema.shape[key];
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

	category: newsletterDataSchema
		.pick({ category: true })
		.describe('Pick a category'),

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
			signUpHeadline: true,
			signUpDescription: true,
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

	readMore: pickAndPrefixRenderingOption(['readMoreSections']).describe(
		'Input the Read More setup',
	),

	tags: newsletterDataSchema
		.pick({
			seriesTag: true,
			composerTag: true,
			composerCampaignTag: true,
		})
		.describe('Input the tag setup'),

	thrasher: pickAndPrefixThrasherOption([
		'singleThrasher',
		'multiThrasher',
		'singleThrasherLocation',
		'thrasherDescription',
	]).describe('Input the thrasher setup'),

	promotionDates: newsletterDataSchema
		.pick({
			launchDate: true,
			signUpPageDate: true,
			thrasherDate: true,
			privateUntilLaunch: true,
		})
		.describe('choose the launch date and promotion plans'),
};
