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
		description: draft.description ?? ' ',
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

const TOTAL_FIELD_COUNT = getDraftNotReadyIssues({}).length;

/**
 * Returns an integer representing a percentage of 'completeness'
 * of the draft, where 100 indicates the draft can be launched.
 *
 * The value is calculated based on the number validation issues
 * raised when testing if the draft could be launched and comparing
 * that to the number of issues raised for an empty draft.
 *
 * The calculation is approximate and only for display purposes.
 */
export const calculateProgress = (draft: DraftNewsletterData): number => {
	const issueCount = getDraftNotReadyIssues(draft).length;
	if (issueCount === 0) {
		return 100;
	}
	const ratio = (TOTAL_FIELD_COUNT - issueCount) / TOTAL_FIELD_COUNT;
	return Math.floor(ratio * 100);
};
