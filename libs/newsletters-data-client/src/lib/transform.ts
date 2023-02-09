import type { NewsletterData } from './newsletter-data-type';
import { isNewsletterData } from './newsletter-data-type';
import type { Newsletter } from './newsletter-type';
import { isNewsletter } from './newsletter-type';

export const TRANSFORM_ERROR_MESSAGE = {
	input: 'invalid input passed to transformNewToOld',
	output: 'invalid output produced by transformNewToOld',
} as const;

const deriveBooleansFromStatus = (
	status: NewsletterData['status'],
): { cancelled: boolean; paused: boolean } => {
	return {
		cancelled: status === 'cancelled',
		paused: status === 'paused',
	};
};

/**
 * Attempts to transform a NewsletterData to Newsletter.
 *
 * Throws an error if the input or output fail validation.
 *
 * NOTE - the NewsletterData is a placeholder type.
 */
export const transformNewToOld = (
	newsletterData: NewsletterData,
): Newsletter => {
	if (!isNewsletterData(newsletterData)) {
		throw new Error(TRANSFORM_ERROR_MESSAGE.input);
	}

	const merged: Newsletter & Partial<NewsletterData> = {
		...newsletterData,
		...deriveBooleansFromStatus(newsletterData.status),
	};

	delete merged.creationTimeStamp;
	delete merged.status;

	if (!isNewsletter(merged)) {
		throw new Error(TRANSFORM_ERROR_MESSAGE.output);
	}
	return merged;
};
