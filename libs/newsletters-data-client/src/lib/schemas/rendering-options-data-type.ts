import { z } from 'zod';
import { nonEmptyString, urlPathString } from '../zod-helpers';
import { themeEnumSchema } from './theme-enum-data-type';

export const readMoreSectionSchema = z
	.object({
		subheading: nonEmptyString().describe('read more subheading'),
		wording: nonEmptyString().describe('read more wording'),
		url: z.string().url().optional().describe('read more url'),
		onwardPath: urlPathString(
			'Please add a Guardian URL from the slash e.g. https://www.theguardian.com/food should be /food',
		).optional(),
		isDarkTheme: z.boolean().optional().describe('use dark theme for section'),
	})
	.describe('Read more section configuration');

export const automatedFrontSectionSchema = z.object({
	subheading: nonEmptyString().describe('the subheading for automated section'),
	insertPosition: z.number(),
	frontPath: urlPathString(),
	sectionName: nonEmptyString(),
	maxArticles: z.number(),
	partBuilderFunction: nonEmptyString(),
});

export const renderingOptionsSchema = z.object({
	displayDate: z.boolean().describe('Display date?'),
	displayStandfirst: z.boolean().describe('Display standfirst?'),
	contactEmail: z.string().email().optional().describe('Contact email'),
	displayImageCaptions: z.boolean().describe('Display image captions?'),
	darkHeadlineBackground: z
		.boolean()
		.optional()
		.describe('Dark headline section?'),
	displayNewsletterName: z
		.boolean()
		.optional()
		.describe('Display Newsletter name above headline?'),

	paletteOverride: themeEnumSchema.optional().describe('Palette override'),
	linkListSubheading: z
		.array(z.string())
		.optional()
		.describe('Link list subheading'),
	podcastSubheading: z
		.array(z.string())
		.optional()
		.describe('Podcast subheading'),
	darkThemeSubheading: z
		.array(z.string())
		.optional()
		.describe('Dark theme subheading'),
	readMoreSections: z
		.array(readMoreSectionSchema)
		.optional()
		.describe('The configuration for read more sections'),
	automatedFrontSections: z
		.array(automatedFrontSectionSchema)
		.optional()
		.describe('The configuration for automated front sections'),

	mainBannerUrl: z
		.string()
		.url()
		.optional()
		.describe('URL for the main banner'),
	subheadingBannerUrl: z
		.string()
		.url()
		.optional()
		.describe('URL for standard subheading banner'),
	darkSubheadingBannerUrl: z
		.string()
		.url()
		.optional()
		.describe('URL for dark subheading banner'),
});
export type RenderingOptions = z.infer<typeof renderingOptionsSchema>;
