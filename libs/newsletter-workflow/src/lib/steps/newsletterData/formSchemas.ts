import type { ZodObject, ZodRawShape } from 'zod';
import { z } from 'zod';
import type {
	RenderingOptions,
	ThrasherOptions,
} from '@newsletters-nx/newsletters-data-client';
import {
	dataCollectionRenderingOptionsSchema,
	dataCollectionSchema,
	thrasherOptionsSchema,
} from '@newsletters-nx/newsletters-data-client';


const pickAndPrefixRenderingOption = (
	fieldKeys: Array<keyof RenderingOptions>,
): ZodObject<ZodRawShape> => {
	const shape: ZodRawShape = {};
	fieldKeys.forEach((key) => {
		shape[`renderingOptions.${key}`] =
			dataCollectionRenderingOptionsSchema.shape[key];
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
	startDraftNewsletter: dataCollectionSchema
		.pick({ name: true })
		.describe('Input the name for the new newsletter'),

	identityName: dataCollectionSchema
		.pick({ identityName: true })
		.describe('Edit the identity name if required'),

	// Exclude 'article-based-legacy' from the options presented:
	// needs to be supported in the schema for existing data, but
	// not an option to present for new newsletters.
	category: z
		.object({
			category: z.enum(
				dataCollectionSchema.shape['category'].options.filter(
					(option) => option !== 'article-based-legacy',
				) as [string, ...string[]],
			),
		})
		.describe('Pick a category'),

	braze: dataCollectionSchema
		.pick({
			brazeSubscribeEventNamePrefix: true,
			brazeNewsletterName: true,
			brazeSubscribeAttributeName: true,
			brazeSubscribeAttributeNameAlternate: true,
		})
		.describe('Edit the Braze values if required'),

	ophan: dataCollectionSchema
		.pick({
			campaignName: true,
			campaignCode: true,
		})
		.describe('Edit the Ophan values if required'),

	pillarAndGroup: dataCollectionSchema
		.pick({
			theme: true,
		})
		.extend({
			// 'group' is a string field since there are no external constraint on what we call the groups
			// but on the formSchema, we can use an enum to allow users to pick from the current list.
			// In practice, we would not want users to be able to create new groups on the all-newsletters page
			// for each newsletter.
			group: z.enum([
				'News in depth',
				'News in brief',
				'Opinion',
				'Features',
				'Culture',
				'Lifestyle',
				'Sport',
				'Work',
				'From the papers',
			]),
		})
		.describe('Choose a theme and a group'),

	signUpPage: dataCollectionSchema
		.pick({
			signUpHeadline: true,
			signUpDescription: true,
		})
		.describe('Input the Sign Up page copy'),

	signUpEmbed: dataCollectionSchema
		.pick({ signUpEmbedDescription: true })
		.describe('Input the Sign Up embed copy'),

	regionFocus: dataCollectionSchema
		.pick({
			regionFocus: true,
		})
		.describe('Select from the drop-down list'),

	newsletterDesign: dataCollectionSchema
		.pick({
			designBriefDoc: true,
			figmaDesignUrl: true,
			figmaIncludesThrashers: true,
		})
		.describe('Input the design brief and Figma design'),

	newsletterHeader: pickAndPrefixRenderingOption([
		'displayStandfirst',
		'displayDate',
		'mainBannerUrl',
	]).describe('Input the header setup'),

	newsletterPaletteOverride: pickAndPrefixRenderingOption([
		'paletteOverride',
	]).describe('Select a palette theme'),

	footer: pickAndPrefixRenderingOption(['contactEmail']).describe(
		'Input the footer setup',
	),

	frequency: dataCollectionSchema
		.pick({
			frequency: true,
		})
		.describe('Input the send frequency'),

	images: pickAndPrefixRenderingOption(['displayImageCaptions']).describe(
		'Specify the image setup',
	),

	onlineArticle: dataCollectionSchema
		.pick({
			onlineArticle: true,
		})
		.describe('Select from the drop-down list'),

	linkList: pickAndPrefixRenderingOption(['linkListSubheading']).describe(
		'Add the subheading triggers',
	),

	darkTheme: pickAndPrefixRenderingOption(['darkThemeSubheading']).describe(
		'Add the subheading triggers',
	),

	podcast: pickAndPrefixRenderingOption(['podcastSubheading']).describe(
		'Add the subheading triggers',
	),

	readMore: pickAndPrefixRenderingOption(['readMoreSections']).describe(
		'Add the Read More setup',
	),

	tags: dataCollectionSchema
		.pick({
			seriesTag: true,
			composerTag: true,
			composerCampaignTag: true,
		})
		.describe('Input the tag setup'),

	singleThrasher: pickAndPrefixThrasherOption([
		'singleThrasher',
		'singleThrasherLocation',
		'thrasherDescription',
	]).describe('Input the thrasher setup'),

	multiThrashers: pickAndPrefixThrasherOption(['multiThrashers']).describe(
		'Input details of the multi-thrashers',
	),

	promotionDates: dataCollectionSchema
		.pick({
			launchDate: true,
			signUpPageDate: true,
			thrasherDate: true,
			privateUntilLaunch: true,
		})
		.describe('choose the launch date and promotion plans'),

	illustrationCard: dataCollectionSchema
		.pick({
			illustrationCard: true,
		})
		.describe('Add the URL for the illustration card'),
};
