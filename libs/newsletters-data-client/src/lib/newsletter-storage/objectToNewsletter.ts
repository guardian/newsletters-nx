import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { makeBlankMeta } from '../schemas/meta-data-type';
import type { NewsletterDataWithMeta } from '../schemas/newsletter-data-type';
import { isNewsletterData } from '../schemas/newsletter-data-type';

export const objectToNewsletter = async (
	getObjectOutput: GetObjectCommandOutput,
): Promise<NewsletterDataWithMeta | undefined> => {
	try {
		const { Body } = getObjectOutput;
		const content = await Body?.transformToString();
		if (!content) {
			return undefined;
		}
		const parsedContent = JSON.parse(content) as unknown;
		if (!isNewsletterData(parsedContent)) {
			return undefined;
		}
		// `meta` is not part of newsletterDataSchema, so records written before
		// it was introduced parse without one. Default it here so every
		// newsletter leaving storage has meta, as drafts already do.
		return {
			meta: makeBlankMeta(),
			...parsedContent,
		};
	} catch (err) {
		console.warn('objectToNewsletter failed');
		console.warn(err);
		return undefined;
	}
};
