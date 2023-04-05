import { z } from 'zod';
import { emailEmbedSchema } from './emailEmbedSchema';
import {
	kebabCasedString,
	nonEmptyString,
	underscoreCasedString,
} from './schema-helpers';

export const themeEnumSchema = z.enum([
	'',
	'news',
	'opinion',
	'culture',
	'sport',
	'lifestyle',
	'features',
]);
export type Theme = z.infer<typeof themeEnumSchema>;

export const regionFocusEnumSchema = z.enum(['', 'UK', 'AU', 'US', 'INTL']);
export type RegionFocus = z.infer<typeof regionFocusEnumSchema>;

export const onlineArticleSchema = z.enum([
	'',
	'Email only',
	'Web for first send only',
	'Web for all sends',
]);
export type OnlineArticle = z.infer<typeof onlineArticleSchema>;

export const singleThrasherLocation = z.enum([
	'',
	'Web only',
	'App only',
	'Web and App',
]);
export type SingleThrasherLocation = z.infer<typeof singleThrasherLocation>;

export const renderingOptionsSchema = z.object({
	displayDate: z.boolean(),
	displayStandfirst: z.boolean(),
	contactEmail: z.string().email(),
	displayImageCaptions: z.boolean(),
	linkListSubheading: z.array(z.string()).optional(),
	podcastSubheading: z.array(z.string()).optional(),
	readMoreSubheading: z.string().optional(),
	readMoreWording: z.string().optional(),
	readMoreUrl: z.string().url().optional(),
});
export type RenderingOptions = z.infer<typeof renderingOptionsSchema>;

export const thrasherOptionsSchema = z.object({
	singleThrasher: z.boolean(),
	multiThrasher: z.boolean(),
	singleThrasherLocation: singleThrasherLocation,
	thrasherDescription: z.string(),
});
export type ThrasherOptions = z.infer<typeof thrasherOptionsSchema>;

export const newsletterCategoriesSchema = z
	.enum(['article-based', 'fronts-based', 'manual-send', 'other'])
	.describe('production category');
export type NewsletterCategory = z.infer<typeof newsletterCategoriesSchema>;

/**
 * NOT FINAL - this schema a placeholder to test the data transformation structure.
 * Edits to this schema would need to be reflected in the transform function.
 * The actual data model is TBC.
 */
export const newsletterDataSchema = z.object({
	identityName: kebabCasedString(),
	name: nonEmptyString(),
	category: newsletterCategoriesSchema,
	restricted: z.boolean(),
	status: z.enum(['paused', 'cancelled', 'live']),
	emailConfirmation: z.boolean(),
	brazeSubscribeAttributeName: underscoreCasedString(),
	brazeSubscribeEventNamePrefix: underscoreCasedString(),
	brazeNewsletterName: underscoreCasedString(),
	theme: themeEnumSchema,
	group: nonEmptyString(),
	headline: z.string().optional(),
	description: nonEmptyString(),
	regionFocus: regionFocusEnumSchema,
	frequency: nonEmptyString(),
	listId: z.number(),
	listIdV1: z.number(),
	emailEmbed: emailEmbedSchema.extend({
		description: z.string(),
	}),
	campaignName: z.string().optional(),
	campaignCode: z.string().optional(),
	brazeSubscribeAttributeNameAlternate: z
		.array(underscoreCasedString())
		.optional(),
	signupPage: z.string().optional(),
	exampleUrl: z.string().optional(),
	designBriefDoc: z.string().optional(),
	figmaDesignUrl: z.string().url().optional(),
	figmaIncludesThrashers: z.boolean(),
	illustrationCircle: z.string().optional(),

	creationTimeStamp: z.number(),
	cancellationTimeStamp: z.number().optional(),

	seriesTag: z.string().optional(),
	composerTag: z.string().optional(),
	composerCampaignTag: z.string().optional(),

	launchDate: z.coerce.date(),
	signUpPageDate: z.coerce.date(),
	thrasherDate: z.coerce.date(),
	privateUntilLaunch: z.boolean(),
	onlineArticle: onlineArticleSchema,

	renderingOptions: renderingOptionsSchema.optional(),
	thrasherOptions: thrasherOptionsSchema.optional(),
});

/** NOT FINAL - this type a placeholder to test the data transformation structure */
export type NewsletterData = z.infer<typeof newsletterDataSchema>;

export function isNewsletterData(subject: unknown): subject is NewsletterData {
	return newsletterDataSchema.safeParse(subject).success;
}

export const draftNewsletterDataSchema = newsletterDataSchema.deepPartial();
export type DraftNewsletterData = z.infer<typeof draftNewsletterDataSchema>;

export function isDraftNewsletterData(
	subject: unknown,
): subject is DraftNewsletterData {
	return draftNewsletterDataSchema.safeParse(subject).success;
}
