import type { EmailEmbed } from './emailEmbedSchema';
import type { DraftNewsletterData } from './newsletter-data-type';
import { newsletterDataSchema } from './newsletter-data-type';

const defaultNewsletterValues: DraftNewsletterData = {
	listIdV1: -1,
	restricted: false,
	status: 'paused', // TO DO - add step for this - maybe best in launch wizard?
	emailConfirmation: false,
	privateUntilLaunch: false,
	figmaIncludesThrashers: false,
	group: 'News in depth', // TO DO - add a step for this
} as const;

// TO DO - the NewsletterData should not have these structure - it's a legacy
// feature. This should happen in deriveLegacyNewsletter
const buildEmailEmbedObject = (draft: DraftNewsletterData): EmailEmbed => {
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
			? `We'll send you ${name} every ${frequency.toLowerCase()}`
			: `We'll send you ${name} every time it comes out`);

	return {
		description: draft.signUpEmbedDescription ?? ' ',
		name: name,
		title: `Sign up to ${name}`,
		successHeadline,
		successDescription: successDescription,
		hexCode: '#DCDCDC',
		...draft.emailEmbed,
	};
};

export const withDefaultNewsletterValues = (
	draft: DraftNewsletterData,
): DraftNewsletterData => {
	return {
		...defaultNewsletterValues,
		...draft,
		emailEmbed: buildEmailEmbedObject(draft),
	};
};

export const hasAllRequiredData = (draft: DraftNewsletterData): boolean => {
	return newsletterDataSchema.safeParse(withDefaultNewsletterValues(draft))
		.success;
};

export const getDraftNotReadyIssues = (draft: DraftNewsletterData) => {
	const report = newsletterDataSchema.safeParse(
		withDefaultNewsletterValues(draft),
	);

	if (!report.success) {
		return report.error.issues;
	}
	return [];
};
