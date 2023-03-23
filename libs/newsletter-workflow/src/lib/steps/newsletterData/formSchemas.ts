import { z } from 'zod';
import {
	newsletterDataSchema,
	onlineArticleSchema,
	renderingOptionsSchema,
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
			'renderingOptions.displayDate': renderingOptionsSchema.shape.displayDate,
			'renderingOptions.displayStandfirst':
				renderingOptionsSchema.shape.displayStandfirst,
		})
		.describe('Input the header setup'),

	footer: z
		.object({
			'renderingOptions.contactEmail':
				renderingOptionsSchema.shape.contactEmail,
		})
		.describe('Input the footer setup'),

	frequency: newsletterDataSchema
		.pick({
			frequency: true,
		})
		.describe('Input the send frequency'),

	images: z
		.object({
			'renderingOptions.displayImageCaptions':
				renderingOptionsSchema.shape.displayImageCaptions,
		})
		.describe('Specify the image setup'),

	onlineArticle: z
		.object({
			onlineArticle: onlineArticleSchema,
		})
		.describe('Select from the drop-down list'),

	linkList: z
		.object({
			'renderingOptions.linkListSubheading':
				renderingOptionsSchema.shape.linkListSubheading,
		})
		.describe('Input the subheading triggers'),

	podcast: z
		.object({
			'renderingOptions.podcastSubheading':
				renderingOptionsSchema.shape.podcastSubheading,
		})
		.describe('Input the subheading triggers'),

	readMore: z
		.object({
			'renderingOptions.readMoreSubheading':
				renderingOptionsSchema.shape.readMoreSubheading,
			'renderingOptions.readMoreWording':
				renderingOptionsSchema.shape.readMoreWording,
			'renderingOptions.readMoreUrl': renderingOptionsSchema.shape.readMoreUrl,
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
