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

/**
 * The single shape the All Newsletters view consumes, so that a launched
 * newsletter and a draft can sit in the same list. Everything that only one of
 * the two sources has is optional here.
 */
export interface NewsletterRow {
	/** Stable key, unique across both sources. */
	id: string;
	kind: NewsletterRowKind;
	/** Path to the newsletter's detail page. */
	href: string;
	name: string;
	theme?: Theme;
	category?: NewsletterCategory;
	/**
	 * The row sub-text, e.g. "News | Article based" - `theme` then `category`,
	 * each humanised. Undefined only when neither value is set.
	 */
	pillarCategoryLabel?: string;
	/** Epoch milliseconds, or undefined when no real edit date is known. */
	lastUpdated?: number;
	thumbnailUrl?: string;
	statusBadge: BadgeContent;
}

/**
 * `theme`/`category` enum values are kebab-cased identifiers (e.g.
 * `article-based`); the design shows them as words with only the first
 * capitalised (e.g. "Article based").
 */
const humanize = (value: string): string => {
	const withSpaces = value.replace(/-/g, ' ');
	return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
};

export const formatPillarCategoryLabel = (
	theme?: Theme,
	category?: NewsletterCategory,
): string | undefined => {
	const labels = [theme, category].filter(Boolean).map(humanize);
	return labels.length > 0 ? labels.join(' | ') : undefined;
};

/**
 * `NewsletterData` has no single thumbnail field, so fall back through the
 * illustrations in the order the design prefers them.
 */
const toThumbnailUrl = (
	newsletter: Pick<
		DraftNewsletterData,
		'illustrationCircle' | 'illustrationSquare' | 'illustrationCard'
	>,
): string | undefined =>
	newsletter.illustrationCircle ??
	newsletter.illustrationSquare ??
	newsletter.illustrationCard;

export const launchedNewsletterToRow = (
	newsletter: NewsletterDataWithMeta,
): NewsletterRow => ({
	id: `launched-${newsletter.identityName}`,
	kind: 'launched',
	href: `/launched/${newsletter.identityName}`,
	name: newsletter.name,
	theme: newsletter.theme,
	category: newsletter.category,
	pillarCategoryLabel: formatPillarCategoryLabel(
		newsletter.theme,
		newsletter.category,
	),
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
	pillarCategoryLabel: formatPillarCategoryLabel(draft.theme, draft.category),
	lastUpdated: deriveUpdatedTimestamp(draft.meta),
	thumbnailUrl: toThumbnailUrl(draft),
	statusBadge: getDraftStatusBadgeContent(draft),
});
