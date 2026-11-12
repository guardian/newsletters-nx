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
	includeBreakingNews: false,
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
		status: draft.status ?? defaultNewsletterValues.status,
	};
};

export const getDraftNotReadyIssues = (draft: DraftNewsletterData) => {
	const schemaToUse =
		draft.category === 'article-based'
			? dataCollectionSchema.extend(
					z.object({
						renderingOptions: dataCollectionRenderingOptionsSchema,
					}).shape,
				)
			: dataCollectionSchema;

	const draftWithDefaults = withDefaultNewsletterValuesAndDerivedFields(draft);
	const report = schemaToUse.safeParse(draftWithDefaults);
	return report.success ? [] : report.error.issues;
};

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
