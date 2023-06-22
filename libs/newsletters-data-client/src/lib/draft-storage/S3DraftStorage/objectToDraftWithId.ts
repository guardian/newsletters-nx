import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { isDraftNewsletterDataWithMeta } from '../../newsletter-data-type';
import type { DraftWithMetaAndId } from '../DraftStorage';

export const objectToDraftWithMetaAndId = async (
	getObjectOutput: GetObjectCommandOutput,
): Promise<DraftWithMetaAndId | undefined> => {
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

		return parsedContent as DraftWithMetaAndId;
	} catch (err) {
		console.warn('objectToDraft failed');
		console.warn(err);
		return undefined;
	}
};
