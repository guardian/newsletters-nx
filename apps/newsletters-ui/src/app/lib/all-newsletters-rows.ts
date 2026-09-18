import type {
	DraftNewsletterData,
	DraftWithIdAndMeta,
	NewsletterCategory,
	NewsletterDataWithMeta,
	Theme,
} from '@newsletters-nx/newsletters-data-client';
import { deriveUpdatedTimestamp } from '@newsletters-nx/newsletters-data-client';
import type { BadgeContent } from '../components/NewsletterStatusBadge';
import {
	getDraftStatusBadgeContent,
	getLaunchedStatusBadgeContent,
} from '../components/NewsletterStatusBadge';

export type NewsletterRowKind = 'launched' | 'draft';

// The single shape the All Newsletters view consumes, so a launched
// newsletter and a draft can sit in the same list.
export interface NewsletterRow {
	/** Stable key, unique across both sources. */
	id: string;
	kind: NewsletterRowKind;
	/** Path to the newsletter's detail page. */
	href: string;
	name: string;
	theme?: Theme;
	category?: NewsletterCategory;
	/** Epoch milliseconds, or undefined when no real edit date is known. */
	lastUpdated?: number;
	thumbnailUrl?: string;
	statusBadge: BadgeContent;
}

// `theme`/`category` are kebab-cased identifiers; the design shows them
// capitalised words (e.g. "Article based").
const humanize = (value: string): string => {
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

// `NewsletterData` has no single thumbnail field; fall back through the
// illustrations, closest aspect ratio to the thumbnail's square slot first
// (illustrationSquare is 1:1, illustrationCircle at least crops symmetrically,
// illustrationCard is 5:4 and would lose the most content to the crop).
const toThumbnailUrl = (
	newsletter: Pick<
		DraftNewsletterData,
		'illustrationCircle' | 'illustrationSquare' | 'illustrationCard'
	>,
): string | undefined => {
	// These are plain optional strings, so an empty string is possible;
	// treat it as absent so it doesn't mask a valid fallback illustration.
	const nonEmpty = (value: string | undefined): string | undefined =>
		value === '' ? undefined : value;

	return (
		nonEmpty(newsletter.illustrationSquare) ??
		nonEmpty(newsletter.illustrationCircle) ??
		nonEmpty(newsletter.illustrationCard)
	);
};

export const launchedNewsletterToRow = (
	newsletter: NewsletterDataWithMeta,
): NewsletterRow => ({
	id: `launched-${newsletter.identityName}`,
	kind: 'launched',
	href: `/launched/${newsletter.identityName}`,
	name: newsletter.name,
	theme: newsletter.theme,
	category: newsletter.category,
	// deriveUpdatedTimestamp, not meta.updatedTimestamp: it collapses the blank
	// and legacy-migration sentinel timestamps to undefined.
	lastUpdated: deriveUpdatedTimestamp(newsletter.meta),
	thumbnailUrl: toThumbnailUrl(newsletter),
	statusBadge: getLaunchedStatusBadgeContent(newsletter.status),
});

export const draftNewsletterToRow = (
	draft: DraftWithIdAndMeta,
): NewsletterRow => ({
	id: `draft-${draft.listId}`,
	kind: 'draft',
	href: `/drafts/${draft.listId}`,
	// A draft can be saved before it has been named.
	name: draft.name ?? `Untitled draft ${draft.listId}`,
	theme: draft.theme,
	category: draft.category,
	lastUpdated: deriveUpdatedTimestamp(draft.meta),
	thumbnailUrl: toThumbnailUrl(draft),
	statusBadge: getDraftStatusBadgeContent(draft),
});
