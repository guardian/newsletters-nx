import type { EmailEmbed } from './emailEmbedSchema';
import type { DraftNewsletterData } from './newsletter-data-type';
import { newsletterDataSchema } from './newsletter-data-type';

const defaultNewsletterValues: DraftNewsletterData = {
	listIdV1: -1,
	restricted: false,
	status: 'paused',
	emailConfirmation: false,
	privateUntilLaunch: false,
	figmaIncludesThrashers: false,
} as const;

const buildEmailEmbedObject = (draft: DraftNewsletterData): EmailEmbed => {
	const name = draft.name ?? 'newsletter';
	const successDescription = draft.frequency
		? `We'll send you ${name} every ${draft.frequency.toLowerCase()}`
		: `We'll send you ${name} every time it comes out`;

	return {
		description: draft.description ?? ' ',
		name: name,
		title: `Sign up to ${name}`,
		successHeadline: 'Subscription confirmed',
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
