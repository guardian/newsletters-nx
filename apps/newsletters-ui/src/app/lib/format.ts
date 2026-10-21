import type {
	NewsletterCategory,
	Theme,
} from '@newsletters-nx/newsletters-data-client';
import dayjs from 'dayjs';

// "01 June 26", or undefined when there's no real date.
export const formatShortDate = (value?: Date | string | null) => {
	// `?? null` because dayjs(undefined) means "now", whereas dayjs(null) is invalid.
	const date = dayjs(value ?? null);
	// Missing dates can arrive as null/0, which z.coerce.date() turns into the
	// 1970 epoch, so treat that as "no date".
	return date.isValid() && date.valueOf() > 0
		? date.format('DD MMMM YY')
		: undefined;
};

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
