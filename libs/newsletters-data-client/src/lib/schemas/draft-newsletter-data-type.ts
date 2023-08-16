import { z } from 'zod';
import { nonEmptyString, urlPathString } from '../zod-helpers';
import type { MetaData } from './meta-data-type';
import { metaDataSchema } from './meta-data-type';
import {
	newsletterDataSchema,
	onlineArticleSchema,
	regionFocusEnumSchema,
} from './newsletter-data-type';
import {
	readMoreSectionSchema,
	renderingOptionsSchema,
} from './rendering-options-data-type';

export const draftNewsletterDataSchema = newsletterDataSchema.deepPartial();
export type DraftNewsletterData = z.infer<typeof draftNewsletterDataSchema>;

export function isDraftNewsletterData(
	subject: unknown,
): subject is DraftNewsletterData {
	return draftNewsletterDataSchema.safeParse(subject).success;
}

export type DraftNewsletterDataWithMeta = DraftNewsletterData & {
	meta: MetaData;
};

export function isDraftNewsletterDataWithMeta(
	subject: unknown,
): subject is DraftNewsletterDataWithMeta {
	return draftNewsletterDataSchema
		.extend({ meta: metaDataSchema })
		.safeParse(subject).success;
}

/**
 * A version of the renderingOptionsSchema
 * for use when defining new drafts.
 *
 * In this version ,the readMoreSections require
 * the `onwardPath` and  exclude the `url`.
 * both are optional in the 'real 'schema.
 */
export const dataCollectionRenderingOptionsSchema =
	renderingOptionsSchema.merge(
		z.object({
			readMoreSections: readMoreSectionSchema
				.pick({
					subheading: true,
					wording: true,
					isDarkTheme: true,
				})
				.merge(
					z.object({
						onwardPath: urlPathString(),
					}),
				)
				.array()
				.optional(),
		}),
	);

/**
 * The schema for collecting data for new drafts.
 *
 * This is stricter than the NewsletterSchema, so we can enforce
 * rules in the UI which aren't required for the data model to
 * work, but are desired for new Newsletters.
 */
export const dataCollectionSchema = newsletterDataSchema.merge(
	z.object({
		onlineArticle: onlineArticleSchema,
		signUpHeadline: nonEmptyString(),
		signUpDescription: nonEmptyString(),
		regionFocus: regionFocusEnumSchema.unwrap(),
	}),
);
