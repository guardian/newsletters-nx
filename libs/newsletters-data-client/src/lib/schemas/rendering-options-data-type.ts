import { z } from 'zod';
import { nonEmptyString, urlPathString } from '../zod-helpers';
import { themeEnumSchema } from './theme-enum-data-type';

export const readMoreSectionSchema = z
	.object({
		subheading: nonEmptyString().describe('read more subheading'),
		wording: nonEmptyString().describe('read more wording'),
		url: z.string().url().optional().describe('read more url'),
		onwardPath: urlPathString().optional(),
		isDarkTheme: z.boolean().optional().describe('use dark theme for section'),
	})
	.describe('Read more section configuration');

export const renderingOptionsSchema = z.object({
	displayDate: z.boolean().describe('Display date?'),
	displayStandfirst: z.boolean().describe('Display standfirst?'),
	contactEmail: z.string().email().optional().describe('Contact email'),
	displayImageCaptions: z.boolean().describe('Display image captions?'),
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
