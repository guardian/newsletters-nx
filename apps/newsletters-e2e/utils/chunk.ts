/**
 * Splits array arr into 'buckets' evenly sized buckets.
 *
 * If the are insufficient elements in T to distribute evenly to all buckets
 * then the last buckets may have fewer elements.
 * @param arr
 * @param buckets
 */
export function chunk<T>(arr: T[], buckets: number): T[][] {
	if (!Number.isInteger(buckets) || buckets < 1) {
		throw new RangeError(`buckets must be a positive integer, got ${buckets}`);
	}
	const size = Math.ceil(arr.length / buckets);
	return Array.from({ length: buckets }, (_, idx) =>
		arr.slice(idx * size, (idx + 1) * size),
	);
}
