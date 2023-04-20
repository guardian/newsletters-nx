import type { LegacyNewsletter } from './legacy-newsletter-type';
import { isLegacyNewsletter } from './legacy-newsletter-type';
import type { NewsletterData } from './newsletter-data-type';
import { isNewsletterData } from './newsletter-data-type';

export const TRANSFORM_ERROR_MESSAGE = {
	input: '[transformDataToLegacyNewsletter] invalid input',
	output:
		'[transformDataToLegacyNewsletter] output is not LegacyNewsletter format',
	transform: '[transformDataToLegacyNewsletter] failed to transform data',
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
const deriveLegacyNewsletter = (
	newsletterData: NewsletterData,
): LegacyNewsletter | undefined => {
	try {
		const statusBooleans = deriveBooleansFromStatus(newsletterData.status);

		const legacyFormat: LegacyNewsletter = {
			identityName: newsletterData.identityName,
			name: newsletterData.name,
			cancelled: statusBooleans.cancelled,
			restricted: newsletterData.restricted,
			paused: statusBooleans.paused,
			emailConfirmation: newsletterData.emailConfirmation,
			brazeNewsletterName: newsletterData.brazeNewsletterName,
			brazeSubscribeAttributeName: newsletterData.brazeSubscribeAttributeName,
			brazeSubscribeEventNamePrefix:
				newsletterData.brazeSubscribeEventNamePrefix,
			theme: newsletterData.theme,
			group: newsletterData.group,
			description: newsletterData.signUpDescription,
			regionFocus: newsletterData.regionFocus,
			frequency: newsletterData.frequency,
			listIdV1: newsletterData.listIdV1,
			listId: newsletterData.listId,
			exampleUrl: newsletterData.exampleUrl,
			signupPage: newsletterData.signupPage,
			illustration: newsletterData.illustrationCircle
				? { circle: newsletterData.illustrationCircle }
				: undefined,
			emailEmbed: newsletterData.emailEmbed,
			campaignName: newsletterData.campaignName,
			campaignCode: newsletterData.campaignCode,
			brazeSubscribeAttributeNameAlternate:
				newsletterData.brazeSubscribeAttributeNameAlternate,
		};

		return legacyFormat;
	} catch (err) {
		console.error(err);
		return undefined;
	}
};

/**
 * Attempts to transform a NewsletterData to LegacyNewsletter.
 *
 * Throws an error if the input or output fail validation.
 *
 * NOTE - the NewsletterData is a placeholder type.
 */
export const transformDataToLegacyNewsletter = (
	newsletterData: NewsletterData,
): LegacyNewsletter => {
	if (!isNewsletterData(newsletterData)) {
		throw new Error(TRANSFORM_ERROR_MESSAGE.input);
	}

	const output = deriveLegacyNewsletter(newsletterData);
	if (!output) {
		throw new Error(TRANSFORM_ERROR_MESSAGE.transform);
	}

	if (!isLegacyNewsletter(output)) {
		throw new Error(TRANSFORM_ERROR_MESSAGE.output);
	}
	return output;
};
