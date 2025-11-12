import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import type { Layout } from './types';
import { layoutSchema } from './types';

export const objectToLayout = async (
	getObjectOutput: GetObjectCommandOutput,
): Promise<Layout | undefined> => {
	try {
		const { Body } = getObjectOutput;
		const content = await Body?.transformToString();
		if (!content) {
			return undefined;
		}
		const parsedContent = JSON.parse(content) as unknown;
		const layoutParse = layoutSchema.safeParse(parsedContent);
		if (!layoutParse.success) {
			console.warn(layoutParse.error.issues);
			return undefined;
		}
		return layoutParse.data;
	} catch (err) {
		console.warn('objectToLayout failed');
		console.warn(err);
		return undefined;
	}
};
