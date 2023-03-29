import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { isDraftNewsletterData } from '../../newsletter-data-type';
import type { DraftWithId } from '../DraftStorage';

export const objectToDraftWithId = async (
	getObjectOutput: GetObjectCommandOutput,
): Promise<DraftWithId | undefined> => {
	try {
		const { Body } = getObjectOutput;
		const content = await Body?.transformToString();
		if (!content) {
			return undefined;
		}
		const parsedContent = JSON.parse(content) as unknown;
		if (!isDraftNewsletterData(parsedContent)) {
			return undefined;
		}
		if (typeof parsedContent.listId !== 'number') {
			return undefined;
		}
		return parsedContent as DraftWithId;
	} catch (err) {
		console.warn('objectToDraft failed');
		console.warn(err);
		return undefined;
	}
};
