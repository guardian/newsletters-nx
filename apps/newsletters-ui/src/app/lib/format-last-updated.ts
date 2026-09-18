// `undefined` means no real edit date is known (see `deriveUpdatedTimestamp`),
// not an invalid value.
export const formatLastUpdated = (timestamp?: number): string => {
	if (!timestamp) {
		return 'Unknown';
	}
	return new Date(timestamp).toDateString();
};
