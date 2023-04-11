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
	displayDate: z.boolean().describe('display date?'),
	displayStandfirst: z.boolean().describe('display standfirst?'),
	contactEmail: z.string().email().describe('contact email'),
	displayImageCaptions: z.boolean().describe('display image captions?'),
	linkListSubheading: z
		.array(z.string())
		.optional()
		.describe('link list subheading'),
	podcastSubheading: z
		.array(z.string())
		.optional()
		.describe('podcast subheading'),
	readMoreSubheading: z.string().optional().describe('read more subheading'),
	readMoreWording: z.string().optional().describe('read more wording'),
	readMoreUrl: z.string().url().optional().describe('read more url'),
	readMoreSections: z
		.array(
			z.object({
				subheading: z.string().optional().describe('read more subheading'),
				wording: z.string().optional().describe('read more wording'),
				url: z.string().url().optional().describe('read more url'),
			}),
		)
		.optional()
		.describe('The configuration for readmore sections'),
});
export type RenderingOptions = z.infer<typeof renderingOptionsSchema>;

export const thrasherOptionsSchema = z.object({
	singleThrasher: z.boolean().describe('single thrasher required?'),
	multiThrasher: z.boolean().describe('multi-thrasher(s) required?'),
	singleThrasherLocation: singleThrasherLocation.describe(
		'single thrasher location',
	),
	thrasherDescription: z.string().describe('thrasher description'),
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
	identityName: kebabCasedString().describe('identity name'),
	name: nonEmptyString(),
	category: newsletterCategoriesSchema,
	restricted: z.boolean(),
	status: z.enum(['paused', 'cancelled', 'live']),
	emailConfirmation: z.boolean().describe('email confirmation'),
	brazeSubscribeAttributeName: underscoreCasedString(),
	brazeSubscribeEventNamePrefix: underscoreCasedString(),
	brazeNewsletterName: underscoreCasedString(),
	theme: themeEnumSchema,
	group: nonEmptyString(),
	headline: z.string().optional().describe('sign up headline'),
	description: nonEmptyString().describe('sign up description'),
	regionFocus: regionFocusEnumSchema.describe('region focus'),
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
	designBriefDoc: z.string().optional().describe('design brief doc'),
	figmaDesignUrl: z.string().url().optional().describe('figma design url'),
	figmaIncludesThrashers: z
		.boolean()
		.describe('figma design includes thrashers?'),
	illustrationCircle: z.string().optional(),

	creationTimeStamp: z.number(),
	cancellationTimeStamp: z.number().optional(),

	seriesTag: z.string().optional().describe('series tag'),
	composerTag: z.string().optional().describe('composer tag'),
	composerCampaignTag: z.string().optional().describe('composer campaign tag'),

	launchDate: z.coerce.date().describe('launch date'),
	signUpPageDate: z.coerce.date().describe('sign up page date'),
	thrasherDate: z.coerce.date().describe('thrasher date'),
	privateUntilLaunch: z.boolean().describe('needs to be private until launch?'),
	onlineArticle: onlineArticleSchema.describe('location of article'),

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
