import { z } from 'zod';
import type { NewsletterFieldsDerivedFromName } from './deriveNewsletterFields';
import { deriveNewsletterFieldsFromName } from './deriveNewsletterFields';
import type { DraftNewsletterData } from './draft-newsletter-data-type';
import {
	dataCollectionRenderingOptionsSchema,
	dataCollectionSchema,
} from './draft-newsletter-data-type';
import type { NewsletterData, RenderingOptions } from './newsletter-data-type';

const defaultNewsletterValues: DraftNewsletterData = {
	listIdV1: -1,
	restricted: false,
	status: 'paused', // TODO - add step for this - maybe best in launch wizard?
	emailConfirmation: false,
	privateUntilLaunch: false,
	figmaIncludesThrashers: false,
} as const;

export const defaultRenderingOptionsValues: Partial<RenderingOptions> = {
	displayDate: false,
	displayImageCaptions: false,
	displayStandfirst: false,
} as const;

export const withDefaultNewsletterValuesAndDerivedFields = (
	draft: DraftNewsletterData,
): DraftNewsletterData &
	Pick<NewsletterData, NewsletterFieldsDerivedFromName> => {
	const derivedFields = deriveNewsletterFieldsFromName(draft.name ?? '');

	if (draft.renderingOptions) {
		return {
			...defaultNewsletterValues,
			...derivedFields,
			...draft,
			//prevent an explicit undefined status on the draft overriding the default
			status: draft.status ? draft.status : defaultNewsletterValues.status,
			renderingOptions: {
				...defaultRenderingOptionsValues,
				...draft.renderingOptions,
			},
		};
	}

	if (draft.category === 'article-based') {
		return {
			...defaultNewsletterValues,
			...derivedFields,
			...draft,
			renderingOptions: {
				...defaultRenderingOptionsValues,
			},
		};
	}

	return {
		...defaultNewsletterValues,
		...derivedFields,
		...draft,
	};
};

export const getDraftNotReadyIssues = (draft: DraftNewsletterData) => {
	const schemaToUse =
		draft.category === 'article-based'
			? dataCollectionSchema.merge(
					z.object({
						renderingOptions: dataCollectionRenderingOptionsSchema,
					}),
			  )
			: dataCollectionSchema;

	const draftWithDefaults = withDefaultNewsletterValuesAndDerivedFields(draft);
	const report = schemaToUse.safeParse(draftWithDefaults);
	return report.success ? [] : report.error.issues;
};

const TOTAL_FIELD_COUNT = getDraftNotReadyIssues({}).length;

export const getRenderingOptionsNotReadyIssues = (
	record: Record<string, unknown>,
) => {
	const report = dataCollectionRenderingOptionsSchema.safeParse({
		...defaultRenderingOptionsValues,
		...record,
	});
	if (!report.success) {
		return report.error.issues;
	}
	return [];
};

const RENDERING_OPTIONS_FIELD_COUNT = getRenderingOptionsNotReadyIssues(
	{},
).length;

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

	const renderingOptionsIssuesCount = getRenderingOptionsNotReadyIssues(
		draft.renderingOptions ?? {},
	).length;

	// if RENDERING_OPTIONS_FIELD_COUNT is 0  an empty object with the defaults
	// added satifies the schema, so there can be no missing required rendering options
	// fields. Also avoid divide by 0 errors.
	const renderingOptionsDataRatio =
		RENDERING_OPTIONS_FIELD_COUNT === 0
			? 1
			: (RENDERING_OPTIONS_FIELD_COUNT - renderingOptionsIssuesCount) /
			  RENDERING_OPTIONS_FIELD_COUNT;

	// Arbitrary calculation - wieght the basic data as 1/4's of the total score
	const combined = (basicDataRatio * 3 + renderingOptionsDataRatio) / 4;
	return Math.floor(combined * 100);
};
