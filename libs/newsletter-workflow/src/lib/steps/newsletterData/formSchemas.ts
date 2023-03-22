import { z } from 'zod';
import {
	newsletterDataSchema,
	onlineArticleSchema,
	singleThrasherLocation,
} from '@newsletters-nx/newsletters-data-client';

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

	frequency: newsletterDataSchema
		.pick({
			frequency: true,
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
