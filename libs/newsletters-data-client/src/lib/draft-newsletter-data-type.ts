import type { z } from 'zod';
import type { MetaData } from './meta-data-type';
import { metaDataSchema } from './meta-data-type';
import { newsletterDataSchema } from './newsletter-data-type';

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
