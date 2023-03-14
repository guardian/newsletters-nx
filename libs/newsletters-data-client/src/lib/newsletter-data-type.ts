import { z } from 'zod';
import { emailEmbedSchema } from './emailEmbedSchema';
import { nonEmptyString } from './schema-helpers';

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

/**
 * NOT FINAL - this schema a placeholder to test the data transformation structure.
 * Edits to this schema would need to be reflected in the transform function.
 * The actual data model is TBC.
 */
export const newsletterDataSchema = z.object({
	identityName: nonEmptyString(),
	name: nonEmptyString(),
	restricted: z.boolean(),
	status: z.enum(['paused', 'cancelled', 'live']),
	emailConfirmation: z.boolean(),
	brazeSubscribeAttributeName: nonEmptyString(),
	brazeSubscribeEventNamePrefix: nonEmptyString(),
	brazeNewsletterName: nonEmptyString(),
	theme: themeEnumSchema,
	group: nonEmptyString(),
	description: nonEmptyString(),
	regionFocus: z.string().optional(),
	frequency: nonEmptyString(),
	listId: z.number(),
	listIdV1: z.number(),
	emailEmbed: emailEmbedSchema.extend({
		description: z.string(),
	}),
	campaignName: z.string().optional(),
	campaignCode: z.string().optional(),
	brazeSubscribeAttributeNameAlternate: z.array(z.string()).optional(),
	signupPage: z.string().optional(),
	exampleUrl: z.string().optional(),
	illustrationCircle: z.string().optional(),

	creationTimeStamp: z.date(),
	cancellationTimeStamp: z.date().optional(),
});

/** NOT FINAL - this type a placeholder to test the data transformation structure */
export type NewsletterData = z.infer<typeof newsletterDataSchema>;

export function isNewsletterData(subject: unknown): subject is NewsletterData {
	return newsletterDataSchema.safeParse(subject).success;
}
