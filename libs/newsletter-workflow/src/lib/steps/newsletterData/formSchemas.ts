import { z } from 'zod';
import {
	kebabCasedString,
	onlineArticleSchema,
	regionFocusEnumSchema,
	singleThrasherLocation,
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

	signUp: z
		.object({
			headline: z.string(),
			description: z.string(),
		})
		.describe('Input the Sign Up page copy'),

	regionFocus: z
		.object({
			regionFocus: regionFocusEnumSchema,
		})
		.describe('Select from the drop-down list'),

	designBrief: z
		.object({
			designBriefDoc: z.string(),
			figmaDesignUrl: z.string().url().optional(),
			figmaIncludesThrashers: z.boolean(),
		})
		.describe('Input the design brief and Figma design'),

	newsletterHeader: z
		.object({
			displayDate: z.boolean(),
			displayStandfirst: z.boolean(),
		})
		.describe('Input the header setup'),

	footer: z
		.object({
			email: z.string().email().optional(),
		})
		.describe('Input the footer setup'),

	frequency: z
		.object({
			frequency: z.string(),
		})
		.describe('Input the send frequency'),

	images: z
		.object({
			displayImageCaptions: z.boolean(),
		})
		.describe('Specify the setup'),

	onlineArticle: z
		.object({
			onlineArticle: onlineArticleSchema,
		})
		.describe('Select from the drop-down list'),

	linkList: z
		.object({
			linkListSubheading: z.string(),
		})
		.describe('Input the subheading triggers'),

	podcast: z
		.object({
			podcastSubheading: z.string(),
		})
		.describe('Input the subheading triggers'),

	readMore: z
		.object({
			readMoreSubheading: z.string(),
			readMoreWording: z.string(),
			readMoreUrl: z.string().url().optional(),
		})
		.describe('Input the Read More setup'),

	tags: z
		.object({
			seriesTag: z.string().url().optional(),
			composerTag: z.string(),
			composerCampaignTag: z.string(),
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
};
