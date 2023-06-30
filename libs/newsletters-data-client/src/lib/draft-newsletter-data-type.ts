import { z } from 'zod';
import type { MetaData } from './meta-data-type';
import { metaDataSchema } from './meta-data-type';
import {
	newsletterDataSchema,
	onlineArticleSchema,
	regionFocusEnumSchema,
} from './newsletter-data-type';
import { nonEmptyString } from './zod-helpers';

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
export type DraftNewsletterDataWithoutMeta = DraftNewsletterData & {
	meta: undefined;
};

export function isDraftNewsletterDataWithMeta(
	subject: unknown,
): subject is DraftNewsletterDataWithMeta {
	return draftNewsletterDataSchema
		.extend({ meta: metaDataSchema })
		.safeParse(subject).success;
}

/**
 * The schema for collecting data for new drafts.
 *
 * This is more strict that the draft schema so we can enforce
 * rules in the UI which aren't required for the data model to
 * work, but are desired for new newsletters.
 */
export const dataCollectionSchema = newsletterDataSchema.merge(
	z.object({
		onlineArticle: onlineArticleSchema,

		signUpHeadline: nonEmptyString(),
		signUpDescription: nonEmptyString(),
		regionFocus: regionFocusEnumSchema.unwrap(),
	}),
);
