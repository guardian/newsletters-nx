import { z } from 'zod';
import { emailEmbedSchema } from './emailEmbedSchema';
import { themeEnumSchema } from './legacy-newsletter-type';
import { nonEmptyString } from './schema-helpers';

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
