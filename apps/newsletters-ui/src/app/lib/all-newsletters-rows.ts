import type {
	DraftNewsletterData,
	MetaData,
	NewsletterCategory,
	NewsletterData,
	Theme,
} from '@newsletters-nx/newsletters-data-client';

/**
 * Newsletters migrated from the legacy data model share this placeholder
 * timestamp (2000-01-01), and rows created before `meta` existed fall back to
 * a blank meta with a zero timestamp. Neither is a real "last updated" date.
 */
const MIGRATION_TIMESTAMP_VALUE = 946684800;

export type NewsletterRowKind = 'launched' | 'draft';

export interface NewsletterRow {
	/** Stable key, unique across both sources. */
	id: string;
	kind: NewsletterRowKind;
	/** Path to the newsletter's detail page. */
	href: string;
	name: string;
	theme?: Theme;
	category?: NewsletterCategory;
	/** Epoch milliseconds, or undefined when no real date is known. */
	lastUpdated?: number;
	thumbnailUrl?: string;
	/** Present on launched rows only. */
	status?: NewsletterData['status'];
}

const themeLabels: Record<Theme, string> = {
	news: 'News',
	opinion: 'Opinion',
	culture: 'Culture',
	sport: 'Sport',
	lifestyle: 'Lifestyle',
	features: 'Features',
};

const categoryLabels: Record<NewsletterCategory, string> = {
	'article-based': 'Article based',
	'article-based-legacy': 'Article based legacy',
	'fronts-based': 'Fronts based',
	'manual-send': 'Manual send',
	other: 'Other',
};

/**
 * The design shows Pillar then Production category, e.g. "News | Article
 * based". Either half can be missing on a draft, in which case only the known
 * half is shown.
 */
export const formatPillarAndCategory = (
	theme?: Theme,
	category?: NewsletterCategory,
): string =>
	[theme ? themeLabels[theme] : undefined, category ? categoryLabels[category] : undefined]
		.filter((part): part is string => !!part)
		.join(' | ');

export const formatLastUpdated = (lastUpdated?: number): string => {
	if (lastUpdated === undefined) {
		return 'Unknown';
	}
	return new Date(lastUpdated).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
};

const toLastUpdated = (meta?: MetaData): number | undefined => {
	const timestamp = meta?.updatedTimestamp;
	if (!timestamp || timestamp === MIGRATION_TIMESTAMP_VALUE) {
		return undefined;
	}
	return timestamp;
};

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
	newsletter: NewsletterData & { meta?: MetaData },
): NewsletterRow => ({
	id: `launched-${newsletter.identityName}`,
	kind: 'launched',
	href: `/launched/${newsletter.identityName}`,
	name: newsletter.name,
	theme: newsletter.theme,
	category: newsletter.category,
	lastUpdated: toLastUpdated(newsletter.meta),
	thumbnailUrl: toThumbnailUrl(newsletter),
	status: newsletter.status,
});

export const draftNewsletterToRow = (
	draft: DraftNewsletterData & { listId: number; meta?: MetaData },
): NewsletterRow => ({
	id: `draft-${draft.listId}`,
	kind: 'draft',
	href: `/drafts/${draft.listId}`,
	name: draft.name ?? `Untitled draft ${draft.listId}`,
	theme: draft.theme,
	category: draft.category,
	lastUpdated: toLastUpdated(draft.meta),
	thumbnailUrl: toThumbnailUrl(draft),
});
