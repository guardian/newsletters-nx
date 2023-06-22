import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { isDraftNewsletterDataWithMeta } from '../../newsletter-data-type';
import type { DraftWithIdAndMeta } from '../DraftStorage';

export const objectToDraftWithMetaAndId = async (
	getObjectOutput: GetObjectCommandOutput,
): Promise<DraftWithIdAndMeta | undefined> => {
	try {
		const { Body } = getObjectOutput;
		const content = await Body?.transformToString();
		if (!content) {
			return undefined;
		}
		const parsedContent = JSON.parse(content) as unknown;
		if (!isDraftNewsletterDataWithMeta(parsedContent)) {
			return undefined;
		}
		if (typeof parsedContent.listId !== 'number') {
			return undefined;
		}

		return parsedContent as DraftWithIdAndMeta;
	} catch (err) {
		console.warn('objectToDraft failed');
		console.warn(err);
		return undefined;
	}
};
