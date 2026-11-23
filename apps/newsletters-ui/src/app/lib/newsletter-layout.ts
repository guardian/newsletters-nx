import type {
	NewsletterCategory,
	NewsletterData,
	RenderingOptions,
} from '@newsletters-nx/newsletters-data-client';
import { renderingOptionsSchema } from '@newsletters-nx/newsletters-data-client';

export const hasNewsletterLayout = (category: NewsletterCategory) =>
	category === 'article-based' || category === 'article-based-legacy';

export const newsletterLayoutPath = (
	identityName: string,
	page: 'details' | 'layout' | 'edit',
) =>
	`/newsletters/${encodeURIComponent(identityName)}/${page === 'edit' ? 'layout/edit' : page}`;

export const newsletterLayoutDestination = (
	{ category, identityName }: Pick<NewsletterData, 'category' | 'identityName'>,
	edit: boolean,
) =>
	newsletterLayoutPath(
		identityName,
		!hasNewsletterLayout(category) ? 'details' : edit ? 'edit' : 'layout',
	);

export const layoutSettingsSchema = renderingOptionsSchema.pick({
	displayDate: true,
	displayStandfirst: true,
	displayImageCaptions: true,
	contactEmail: true,
	includeBreakingNews: true,
	darkHeadlineBackground: true,
	bulletListStyle: true,
	paletteOverride: true,
	linkListSubheading: true,
	questionBlockSubheading: true,
	podcastSubheading: true,
	darkThemeSubheading: true,
	readMoreSections: true,
	automatedFrontSections: true,
});

export type LayoutSettings = Pick<
	RenderingOptions,
	keyof typeof layoutSettingsSchema.shape
>;

export const layoutSettingKeys = Object.keys(
	layoutSettingsSchema.shape,
) as (keyof LayoutSettings)[];

export const defaultLayoutSettings = {
	displayDate: false,
	displayStandfirst: false,
	displayImageCaptions: false,
};

export const sameLayoutValue = (a: unknown, b: unknown) =>
	JSON.stringify(a) === JSON.stringify(b);

// Apply only the fields edited in this session to the latest saved options.
export const mergeLayoutSettings = (
	latest: RenderingOptions | undefined,
	initial: LayoutSettings,
	edited: LayoutSettings,
): RenderingOptions => ({
	...defaultLayoutSettings,
	...latest,
	...Object.fromEntries(
		layoutSettingKeys
			.filter((key) => !sameLayoutValue(initial[key], edited[key]))
			.map((key) => [key, edited[key]]),
	),
});
