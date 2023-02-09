import type { NewsletterData } from './newsletter-data-type';
import { isNewsletterData } from './newsletter-data-type';
import type { Newsletter } from './newsletter-type';
import { isNewsletter } from './newsletter-type';

export const TRANSFORM_ERROR_MESSAGE = {
	input: 'invalid input passed to transformNewToOld',
	output: 'invalid output produced by transformNewToOld',
	transform: 'transformNewToOld failed to derive',
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
 * The operation is currently 'safe' but is wrapped in a try
 * block transforming to as the final data model might require
 * casting looking up external references.
 */
const deriveNewsletter = (
	newsletterData: NewsletterData,
): Newsletter | undefined => {
	try {
		const merged: Newsletter & Partial<NewsletterData> = {
			...newsletterData,
			...deriveBooleansFromStatus(newsletterData.status),
		};

		delete merged.creationTimeStamp;
		delete merged.status;

		return merged;
	} catch (err) {
		console.error(err);
		return undefined;
	}
};

/**
 * Attempts to transform a NewsletterData to Newsletter.
 *
 * Throws an error if the input or output fail validation.
 *
 * NOTE - the NewsletterData is a placeholder type.
 */
export const transformDataToLegacyNewsletter = (
	newsletterData: NewsletterData,
): Newsletter => {
	if (!isNewsletterData(newsletterData)) {
		throw new Error(TRANSFORM_ERROR_MESSAGE.input);
	}

	const output = deriveNewsletter(newsletterData);
	if (!output) {
		throw new Error(TRANSFORM_ERROR_MESSAGE.transform);
	}

	if (!isNewsletter(output)) {
		throw new Error(TRANSFORM_ERROR_MESSAGE.output);
	}
	return output;
};
