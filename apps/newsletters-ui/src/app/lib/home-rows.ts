import type { NewsletterRow } from './all-newsletters-rows';

/**
 * Splits rows into the homepage's cards. Expects `rows` sorted most
 * recently updated first.
 */
export const splitHomeRows = (
	rows: NewsletterRow[],
): { drafts: NewsletterRow[] } => ({
	drafts: rows.filter((row) => row.kind === 'draft'),
});
