import type { NewsletterRow } from './all-newsletters-rows';

export const LAUNCHED_LIMIT = 15;

/**
 * Splits rows into the homepage's two sections. Expects `rows` sorted most
 * recently updated first. Every draft is kept; launched newsletters are
 * capped at `LAUNCHED_LIMIT`.
 */
export const splitHomeRows = (
	rows: NewsletterRow[],
): { drafts: NewsletterRow[]; launched: NewsletterRow[] } => ({
	drafts: rows.filter((row) => row.kind === 'draft'),
	launched: rows
		.filter((row) => row.kind === 'launched')
		.slice(0, LAUNCHED_LIMIT),
});
