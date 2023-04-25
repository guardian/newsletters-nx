import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import type { NewsletterData } from '../newsletter-data-type';
import { isNewsletterData } from '../newsletter-data-type';

export const objectToNewsletter = async (
	getObjectOutput: GetObjectCommandOutput,
	key: string | undefined
): Promise<NewsletterData | undefined> => {
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
		return {...parsedContent, key};
	} catch (err) {
		console.warn('objectToDraft failed');
		console.warn(err);
		return undefined;
	}
};
