/**
 * Formats a row's `lastUpdated` epoch-milliseconds value for display.
 * `all-newsletters-rows.ts` already collapses blank/legacy-migration
 * timestamps to `undefined` via `deriveUpdatedTimestamp`, so `undefined` here
 * means "no real edit date is known" rather than an invalid value.
 */
export const formatLastUpdated = (timestamp?: number): string => {
	if (!timestamp) {
		return 'Unknown';
	}
	return new Date(timestamp).toDateString();
};
