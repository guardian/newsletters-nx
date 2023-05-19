import type { DraftNewsletterData } from './newsletter-data-type';
import {
	newsletterDataSchema,
	renderingOptionsSchema,
} from './newsletter-data-type';

const defaultNewsletterValues: DraftNewsletterData = {
	listIdV1: -1,
	restricted: false,
	status: 'paused', // TODO - add step for this - maybe best in launch wizard?
	emailConfirmation: false,
	privateUntilLaunch: false,
	figmaIncludesThrashers: false,
} as const;

export const withDefaultNewsletterValues = (
	draft: DraftNewsletterData,
): DraftNewsletterData => {
	return {
		...defaultNewsletterValues,
		...draft,
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

export const renderingOptionsNotReadyIssues = (record: unknown) => {
	const report = renderingOptionsSchema.safeParse(record);
	if (!report.success) {
		return report.error.issues;
	}
	return [];
};

const RENDERING_OPTIONS_FIELD_COUNT = renderingOptionsNotReadyIssues({}).length;

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
	const basicDataIssueCount = getDraftNotReadyIssues(draft).length;

	const basicDataRatio =
		basicDataIssueCount === 0
			? 1
			: (TOTAL_FIELD_COUNT - basicDataIssueCount) / TOTAL_FIELD_COUNT;

	if (draft.category !== 'article-based') {
		return Math.floor(basicDataRatio * 100);
	}

	const renderingOptionsIssuesCount = renderingOptionsNotReadyIssues(
		draft.renderingOptions ?? {},
	).length;

	const renderingOptionsDataRatio =
		(RENDERING_OPTIONS_FIELD_COUNT - renderingOptionsIssuesCount) /
		RENDERING_OPTIONS_FIELD_COUNT;

	// Arbitrary calculation - wieght the basic data as 2/3's of the total score
	const combined = (basicDataRatio * 2 + renderingOptionsDataRatio) / 3;
	return Math.floor(combined * 100);
};
