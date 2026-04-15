import type { z } from 'zod';
import type { MetaData } from './meta-data-type';
import { metaDataSchema } from './meta-data-type';
import {
	newsletterDataSchema,
	thrasherOptionsSchema,
} from './newsletter-data-type';
import { renderingOptionsSchema } from './rendering-options-data-type';

export const draftNewsletterDataSchema = newsletterDataSchema.partial().extend({
	renderingOptions: renderingOptionsSchema.partial().optional(),
	thrasherOptions: thrasherOptionsSchema.partial().optional(),
});
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
