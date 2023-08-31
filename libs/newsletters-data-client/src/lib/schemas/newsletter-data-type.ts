import { z } from 'zod';
import {
	kebabOrUnderscoreCasedString,
	nonEmptyString,
	underscoreCasedString,
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
	.enum(['UK', 'AU', 'US', 'INTL'])
	.optional();
export type RegionFocus = z.infer<typeof regionFocusEnumSchema>;

export const onlineArticleSchema = z
	.enum(['Email only', 'Web for first send only', 'Web for all sends'])
	.describe('location of article');
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
					// TODO - these should be drop-downs populated from existing launched newsletters
					// plus the draft currently being created
					// TODO - this has specifically been defined as a triple-thrasher, rather than a
					// multi-thrasher.  The vast majority of multi-thrashers are triple-thrashers, so
					// this is suitable for the mvp, but occasionally more than 3 newsletters are required
					thrasher1: z.string().optional().describe('left-hand thrasher'),
					thrasher2: z.string().optional().describe('middle thrasher'),
					thrasher3: z.string().optional().describe('right-hand-thrasher'),
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
	name: nonEmptyString(),
	category: newsletterCategoriesSchema,
	restricted: z.boolean(),
	/** The status for the newsletter:
	 *
	 *  - **pending**: Initial state after launch - can be promoted, not yet ready to be sent out.
	 *    Counts as being **paused** for the same of converting to the legacy data model.
	 *  - **live**: Able to be sent and/or currently being sent out to subscribers
	 *  - **paused**: Currently not live, but might be restarted in future
	 *  - **cancelled**: Permanently cancelled - must still exist in the API for referential integrity
	 */
	status: z.enum(['paused', 'cancelled', 'live', 'pending']),
	emailConfirmation: z.boolean().describe('email confirmation'),
	brazeSubscribeAttributeName: underscoreCasedString(),
	brazeSubscribeEventNamePrefix: kebabOrUnderscoreCasedString(),
	brazeNewsletterName: underscoreCasedString(),
	theme: themeEnumSchema,
	group: nonEmptyString(),
	signUpHeadline: z.string().optional().describe('sign up headline'),
	signUpDescription: nonEmptyString().describe('sign up description'),
	signUpEmbedDescription: nonEmptyString().describe(
		'sign up embed description',
	),
	regionFocus: regionFocusEnumSchema.describe('region focus'),
	frequency: nonEmptyString(),
	listId: z.number(),
	listIdV1: z.number(),
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
		.describe('Does the figma design include thrashers?'),
	illustrationCircle: z.string().optional(),
	illustrationCard: z
		.string()
		.url()
		.optional()
		.describe('url for 5:3 image to use on the newsletters page'),

	creationTimeStamp: z.number(),
	cancellationTimeStamp: z.number().optional(),

	seriesTag: z.string().optional().describe('series tag'),
	composerTag: z.string().optional().describe('composer tag(s)'),
	composerCampaignTag: z.string().optional().describe('composer campaign tag'),

	launchDate: z.coerce.date().describe('launch date'),
	signUpPageDate: z.coerce.date().describe('sign up page date'),
	thrasherDate: z.coerce.date().describe('thrasher date'),
	privateUntilLaunch: z.boolean().describe('needs to be private until launch?'),
	onlineArticle: onlineArticleSchema.optional(),

	renderingOptions: renderingOptionsSchema.optional(),
	thrasherOptions: thrasherOptionsSchema.optional(),
	mailSuccessDescription: z.string().optional(),
	brazeCampaignCreationsStatus: workflowStatusEnumSchema,
	ophanCampaignCreationsStatus: workflowStatusEnumSchema,
	signupPageCreationsStatus: workflowStatusEnumSchema,
	tagCreationsStatus: workflowStatusEnumSchema,
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