import { z } from 'zod';
import type { NewsletterFieldsDerivedFromName } from './derive-newsletter-fields';
import { deriveNewsletterFieldsFromName } from './derive-newsletter-fields';
import {
	dataCollectionRenderingOptionsSchema,
	dataCollectionSchema,
} from './schemas/data-collection-schema';
import type { DraftNewsletterData } from './schemas/draft-newsletter-data-type';
import type { NewsletterData } from './schemas/newsletter-data-type';
import type { RenderingOptions } from './schemas/rendering-options-data-type';

const defaultNewsletterValues: DraftNewsletterData = {
	listIdV1: -1,
	restricted: false,
	status: 'pending',
	emailConfirmation: false,
	privateUntilLaunch: false,
	figmaIncludesThrashers: false,
} as const;

// Note - the defaults currently make us a valid set of RenderingOptions
// as there are no required values that can't be defaulted.
// If the schema changes, this might not be the case and the
// defaults should be typed as Partial<RenderingOptions>
export const defaultRenderingOptionsValues: RenderingOptions = {
	displayDate: false,
	displayImageCaptions: false,
	displayStandfirst: false,
} as const;

export const withDefaultNewsletterValuesAndDerivedFields = (
	draft: DraftNewsletterData,
): DraftNewsletterData &
	Pick<NewsletterData, NewsletterFieldsDerivedFromName> => {
	const derivedFields = deriveNewsletterFieldsFromName(draft.name ?? '');

	const getDefaultedRenderingOptions = () => {
		// if the draft is article based, the rendering options must be populated
		// use the default values, even if draft.renderingOptions is undefined
		if (draft.category === 'article-based') {
			return {
				...defaultRenderingOptionsValues,
				...draft.renderingOptions,
			};
		}

		// if the draft is not article based, the rendering options are optional
		// if set, add in the default values to draft.renderingOptions.
		if (draft.renderingOptions) {
			return {
				...defaultRenderingOptionsValues,
				...draft.renderingOptions,
			};
		}
		// if value is undefined, leave as undefined
		return undefined;
	};

	return {
		...defaultNewsletterValues,
		...derivedFields,
		...draft,
		renderingOptions: getDefaultedRenderingOptions(),
		//prevent an explicit undefined status on the draft overriding the default
		status: draft.status ? draft.status : defaultNewsletterValues.status,
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
