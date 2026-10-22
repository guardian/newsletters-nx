import type {
	NewsletterCategory,
	Theme,
} from '@newsletters-nx/newsletters-data-client';

// `theme`/`category` are kebab-cased identifiers; the design shows them
// capitalised words (e.g. "Article based").
export const humanize = (value: string): string => {
	const withSpaces = value.replace(/-/g, ' ');
	return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

export const formatPillarCategoryLabel = (
	theme?: Theme,
	category?: NewsletterCategory,
): string | undefined => {
	const labels = [theme, category]
		.filter((value): value is NonNullable<typeof value> => Boolean(value))
		.map(humanize);
	return labels.length > 0 ? labels.join(' | ') : undefined;
};

// `undefined` means no real edit date is known (see `deriveUpdatedTimestamp`),
// not an invalid value.
export const formatLastUpdated = (timestamp?: number): string => {
	if (!timestamp) {
		return 'Unknown';
	}
	return new Date(timestamp).toDateString();
};
