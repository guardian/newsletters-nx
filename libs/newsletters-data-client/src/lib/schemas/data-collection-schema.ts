import { z } from 'zod';
import { nonEmptyString } from '../zod-helpers';
import {
	newsletterDataSchema,
	onlineArticleSchema,
	regionFocusEnumSchema,
} from './newsletter-data-type';
import {
	automatedFrontSectionSchema,
	readMoreSectionSchema,
	renderingOptionsSchema,
} from './rendering-options-data-type';

// TO DO - can we fetch the list of supported functions from email-rendering
// and dynamically create the schema? is that overkill?
// NOTE - data validation schema types partBuilderFunction as non-empty string
// seemed too rigid to use the names in the data schema - might need a data migration
// to add/remove/deprecate options. Defining the options for data collection only
// give enough flexibility
const builderFunctionNames = [
	'buildLinkListPart',
	'buildListPartWithTrailText',
	'buildListPartWithKeyword',
	'buildNumberedListPartWithKeyword',
	'buildNumberedListPart',
	'buildNumberedListPartWithContributors',
] as const;

const automatedFrontSectionSchemaWithFunctionNames =
	automatedFrontSectionSchema.merge(
		z.object({
			partBuilderFunction: z.enum(builderFunctionNames),
		}),
	);

/**
 * require the `onwardPath`and exclude the `url`.
 * both are optional in the newsletter schema.
 * `url` is deprecated.
 */
const readMoreSectionSchemaWithOnwardPath = readMoreSectionSchema
	.omit({
		url: true,
	})
	.merge(
		z.object({
			onwardPath: readMoreSectionSchema.shape.onwardPath.unwrap(),
		}),
	);

/**
 * A version of the renderingOptionsSchema
 * for use when defining new drafts and using
 * the preview editor.
 */
export const dataCollectionRenderingOptionsSchema =
	renderingOptionsSchema.merge(
		z.object({
			readMoreSections: z
				.array(readMoreSectionSchemaWithOnwardPath)
				.optional()
				.describe('"Read more" sections'),

			automatedFrontSections: z
				.array(automatedFrontSectionSchemaWithFunctionNames)
				.optional()
				.describe('Automated sections from Fronts'),
		}),
	);

// Exclude 'article-based-legacy' from the options presented:
// needs to be supported in the schema for existing data, but
// not an option to present for new newsletters.
const dataCollectionCategories = z.enum(
	newsletterDataSchema.shape['category'].options.filter(
		(option) => option !== 'article-based-legacy',
	) as [string, ...string[]],
);

// 'group' is a string field since there are no external constraint on what we call the groups
// butduring datacollection, we can use an enum to allow users to pick from the current list.
// In practice, we would not want users to be able to create new groups for MMA
// for each newsletter.
const dataCollectionGroup = z
	.enum([
		'News in depth',
		'News in brief',
		'Opinion',
		'Features',
		'Culture',
		'Lifestyle',
		'Sport',
		'Work',
		'From the papers',
	])
	.describe('Group for MMA page');

/**
 * The schema for collecting data for new drafts.
 *
 * This is stricter than the NewsletterSchema, so we can enforce
 * rules in the UI which aren't required for the data model to
 * work, but are desired for new Newsletters.
 */
export const dataCollectionSchema = newsletterDataSchema.merge(
	z.object({
		onlineArticle: onlineArticleSchema,
		category: dataCollectionCategories,
		signUpHeadline: nonEmptyString().describe('Sign-up headline'),
		signUpDescription: nonEmptyString().describe('Sign-up description'),
		group: dataCollectionGroup,
		regionFocus: regionFocusEnumSchema.unwrap(),
	}),
);
