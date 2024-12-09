import { z } from 'zod';
import {
	kebabOrUnderscoreCasedString,
	nonEmptyString,
	tagPathString,
	underscoreCasedString,
	urlPathString,
} from '../zod-helpers';
import type { MetaData } from './meta-data-type';
import { metaDataSchema } from './meta-data-type';
import { renderingOptionsSchema } from './rendering-options-data-type';
import { themeEnumSchema } from './theme-enum-data-type';

export const workflowStatusEnumSchema = z.enum([
	'NOT_REQUESTED',
	'REQUESTED',
	'COMPLETED',
]);

export type WorkflowStatus = z.infer<typeof workflowStatusEnumSchema>;

export const regionFocusEnumSchema = z
	.enum(['UK', 'AU', 'US', 'INT', 'EUR'])
	.optional()
	.describe('Regional Focus');
export type RegionFocus = z.infer<typeof regionFocusEnumSchema>;

export const onlineArticleSchema = z
	.enum(['Email only', 'Web for first send only', 'Web for all sends'])
	.describe('Location of article');
export type OnlineArticle = z.infer<typeof onlineArticleSchema>;

export const singleThrasherLocation = z
	.enum(['Web only', 'App only', 'Web and App'])
	.optional();
export type SingleThrasherLocation = z.infer<typeof singleThrasherLocation>;

export const thrasherOptionsSchema = z.object({
	singleThrasher: z.boolean().describe('Single thrasher required?'),
	singleThrasherLocation: singleThrasherLocation.describe(
		'single thrasher location',
	),
	thrasherDescription: z.string().describe('Thrasher description'),
	multiThrashers: z
		.array(
			z
				.object({
					thrasher1: z.string().optional().describe('newsletter name 1'),
					thrasher2: z.string().optional().describe('newsletter name 2'),
					thrasher3: z.string().optional().describe('newsletter name 3'),
				})
				.describe('multi-thrasher configuration'),
		)
		.optional()
		.describe('The configuration for multi-thrashers'),
});
export type ThrasherOptions = z.infer<typeof thrasherOptionsSchema>;

export const newsletterCategoriesSchema = z
	.enum([
		'article-based',
		'article-based-legacy',
		'fronts-based',
		'manual-send',
		'other',
	])
	.describe('Production category');
export type NewsletterCategory = z.infer<typeof newsletterCategoriesSchema>;

/**
 * NOT FINAL - this schema a placeholder to test the data transformation structure.
 * Edits to this schema would need to be reflected in the transform function.
 * The actual data model is TBC.
 */
export const newsletterDataSchema = z.object({
	identityName: kebabOrUnderscoreCasedString().describe('identity name'),
	name: nonEmptyString().describe('Name'),
	category: newsletterCategoriesSchema,
	restricted: z.boolean().describe('Restricted'),
	/** The status for the newsletter:
	 *
	 *  - **pending**: Initial state after launch - can be promoted, not yet ready to be sent out.
	 *    Counts as being **paused** for the same of converting to the legacy data model.
	 *  - **live**: Able to be sent and/or currently being sent out to subscribers
	 *  - **paused**: Currently not live, but might be restarted in future
	 *  - **cancelled**: Permanently cancelled - must still exist in the API for referential integrity
	 */
	status: z.enum(['paused', 'cancelled', 'live', 'pending']).describe('Status'),
	emailConfirmation: z.boolean().describe('email confirmation'),
	brazeSubscribeAttributeName: underscoreCasedString(),
	brazeSubscribeEventNamePrefix: kebabOrUnderscoreCasedString(),
	brazeNewsletterName: underscoreCasedString(),
	/**
	 * The name of the Pillar to associate this newsletter under
	 *
	 * Note that the display name(set using the schema description)
	 * for this field in the tool is "pillar".
	 * */
	theme: themeEnumSchema,
	group: nonEmptyString().describe('Group'),
	signUpHeadline: z.string().optional().describe('Sign up headline'),
	signUpDescription: nonEmptyString().describe('Sign up description'),
	signUpEmbedDescription: nonEmptyString().describe(
		'Sign up embed description',
	),
	regionFocus: regionFocusEnumSchema.describe('Region focus'),
	frequency: nonEmptyString().describe('Frequency'),
	listId: z.number(),
	listIdV1: z.number(),
	campaignName: z.string().optional(),
	campaignCode: z.string().optional(),
	brazeSubscribeAttributeNameAlternate: z
		.array(underscoreCasedString())
		.optional(),
	signupPage: urlPathString(
		'Please add the path of the Guardian URL from the slash e.g. for https://www.theguardian.com/global/sign-up-for-newsletter just use /global/sign-up-for-newsletter',
	)
		.optional()
		.describe('Path to Sign up page'),
	exampleUrl: z.string().optional().describe('Example url'),
	designBriefDoc: z.string().optional().describe('Design brief doc'),
	figmaDesignUrl: z.string().url().optional().describe('Figma design url'),
	figmaIncludesThrashers: z
		.boolean()
		.describe('Does the figma design include thrashers?'),
	illustrationCircle: z.string().optional(),
	illustrationCard: z
		.string()
		.url()
		.optional()
		.describe('URL of image the newsleter graphic/logo (5:3 format)'),
	illustrationSquare: z
		.string()
		.url()
		.optional()
		.describe('URL of image the newsleter graphic/logo (1:1 format)'),

	creationTimeStamp: z.number(),
	cancellationTimeStamp: z.number().optional(),

	seriesTag: tagPathString(
		'Please add the path of the series tag e.g. for https://www.theguardian.com/world/series/first-edition just use world/series/first-edition. Can only include lower-case letters, number and dashes, separated by slashes',
	)
		.optional()
		.describe('Series tag (path)'),
	seriesTagDescription: z
		.string()
		.optional()
		.describe('The Series tag description'),
	composerTag: z.string().optional().describe('Composer tag(s)'),
	composerCampaignTag: z
		.string()
		.optional()
		.describe('Composer campaign tag description'),

	launchDate: z.coerce.date().describe('Launch date'),
	signUpPageDate: z.coerce.date().describe('Sign up page date'),
	thrasherDate: z.coerce.date().describe('Thrasher date'),
	privateUntilLaunch: z.boolean().describe('Needs to be private until launch?'),
	onlineArticle: onlineArticleSchema.optional(),

	renderingOptions: renderingOptionsSchema.optional(),
	thrasherOptions: thrasherOptionsSchema.optional(),
	mailSuccessDescription: z
		.string()
		.optional()
		.describe('Sign-up success message'),
	brazeCampaignCreationStatus: workflowStatusEnumSchema.describe(
		'Braze campaign creation status',
	),
	ophanCampaignCreationStatus: workflowStatusEnumSchema
		.optional()
		.describe(
			'Ophan campaign creation status',
		),
	signupPageCreationStatus: workflowStatusEnumSchema.describe(
		'Sign up creation status',
	),
	tagCreationStatus: workflowStatusEnumSchema.describe('Tag creation status'),
});

/** NOT FINAL - this type a placeholder to test the data transformation structure */
export type NewsletterData = z.infer<typeof newsletterDataSchema>;

export function isNewsletterData(subject: unknown): subject is NewsletterData {
	return newsletterDataSchema.safeParse(subject).success;
}

export type NewsletterDataWithMeta = NewsletterData & { meta: MetaData };
export type NewsletterDataWithoutMeta = NewsletterData & { meta: undefined };

export function isNewsletterDataWithMeta(
	subject: unknown,
): subject is NewsletterDataWithMeta {
	return newsletterDataSchema
		.extend({ meta: metaDataSchema })
		.safeParse(subject).success;
}

export function isPartialNewsletterData(
	subject: unknown,
): subject is Partial<NewsletterData> {
	return newsletterDataSchema.partial().safeParse(subject).success;
}
