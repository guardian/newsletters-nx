import type { DraftNewsletterData } from './schemas/draft-newsletter-data-type';
import type { LegacyNewsletter } from './schemas/legacy-newsletter-type';
import { isLegacyNewsletter } from './schemas/legacy-newsletter-type';
import { isNewsletterData } from './schemas/newsletter-data-type';
import type { NewsletterData } from './schemas/newsletter-data-type';

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
		paused: status === 'paused' || status === 'pending',
	};
};

const deriveEmailEmbedObject = (
	draft: DraftNewsletterData,
): LegacyNewsletter['emailEmbed'] => {
	const {
		name = 'newsletter',
		emailConfirmation = false,
		frequency,
		mailSuccessDescription,
	} = draft;

	const successHeadline = emailConfirmation
		? 'Check your email inbox and confirm your subscription'
		: 'Subscription confirmed';

	const successDescription =
		mailSuccessDescription ??
		(frequency
			? `We'll send you ${name} ${frequency.toLowerCase()}`
			: `We'll send you ${name} every time it comes out`);

	return {
		description: draft.signUpEmbedDescription ?? ' ',
		name: name,
		title: `Sign up for ${name}`,
		successHeadline,
		successDescription: successDescription,
		hexCode: '#DCDCDC',
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
		const { cancelled, paused } = deriveBooleansFromStatus(
			newsletterData.status,
		);

		return {
			identityName: newsletterData.identityName,
			name: newsletterData.name,
			cancelled,
			restricted: newsletterData.status === 'pending' || newsletterData.restricted,
			paused,
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
			emailEmbed: deriveEmailEmbedObject(newsletterData),
			campaignName: newsletterData.campaignName,
			campaignCode: newsletterData.campaignCode,
			brazeSubscribeAttributeNameAlternate:
				newsletterData.brazeSubscribeAttributeNameAlternate,
		};
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
