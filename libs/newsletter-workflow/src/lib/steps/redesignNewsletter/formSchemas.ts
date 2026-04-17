import type { ZodObject, ZodRawShape, ZodType } from 'zod';
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
	const shape: Record<string, ZodType> = {};
	fieldKeys.forEach((key) => {
		shape[`renderingOptions.${key}`] = dataCollectionRenderingOptionsSchema
			.shape[key] as ZodType;
	});
	return z.object(shape);
};

const pickAndPrefixThrasherOption = (
	fieldKeys: Array<keyof ThrasherOptions>,
): ZodObject<ZodRawShape> => {
	const shape: Record<string, ZodType> = {};
	fieldKeys.forEach((key) => {
		shape[`thrasherOptions.${key}`] = thrasherOptionsSchema.shape[
			key
		] as ZodType;
	});
	return z.object(shape);
};

export const formSchemas = {
	nameAndFrequency: dataCollectionSchema
		.pick({ name: true, frequency: true, regionFocus: true })
		.describe('New newsletter set up'),

	identityName: dataCollectionSchema
		.pick({ identityName: true })
		.describe('Edit the identity name if required'),

	productionDetails: dataCollectionSchema
		.pick({
			category: true,
			onlineArticle: true,
		})
		.describe('Set Production details'),

	targeting: dataCollectionSchema
		.pick({
			theme: true,
			group: true,
		})
		.describe('Set targeting options'),

	promotionDates: dataCollectionSchema
		.pick({
			launchDate: true,
			signUpPageDate: true,
			privateUntilLaunch: true,
		})
		.describe('Launch/Promotion Details'),

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

	promotionContent: dataCollectionSchema
		.pick({
			signUpHeadline: true,
			signUpDescription: true,
			signUpEmbedDescription: true,
			mailSuccessDescription: true,
			illustrationCard: true,
			illustrationSquare: true,
		})
		.describe('Add promotion copy and newsletters page image'),

	newsletterHeader: pickAndPrefixRenderingOption([
		'displayStandfirst',
		'displayDate',
		'mainBannerUrl',
	]).describe('Add the header setup'),

	newsletterPaletteOverride: pickAndPrefixRenderingOption([
		'paletteOverride',
	]).describe('Select a palette theme'),

	footer: pickAndPrefixRenderingOption(['contactEmail']).describe(
		'Add the footer setup',
	),

	images: pickAndPrefixRenderingOption(['displayImageCaptions']).describe(
		'Specify the image setup',
	),

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
			seriesTagDescription: true,
			composerTag: true,
			composerCampaignTag: true,
		})
		.describe('Add the tag setup'),

	thrashers: pickAndPrefixThrasherOption([
		'singleThrasher',
		'singleThrasherLocation',
		'thrasherDescription',
		'multiThrashers',
	]).describe('Add the thrasher requests'),
};
