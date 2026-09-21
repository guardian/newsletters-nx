type NullishPosition = 'NULLISH_FIRST' | 'NULLISH_LAST';
type SortDirection = 'ASCENDING' | 'DESCENDING';

/**
 * Builds an `Array.prototype.sort` comparator from a numeric key selector,
 * placing items with a nullish key first or last rather than letting them
 * clump according to how `undefined`/`null` coerce in arithmetic.
 */
export function sortByNumber<T>(
	selector: (item: T) => number | null | undefined,
	direction: SortDirection = 'ASCENDING',
	nullishPosition: NullishPosition = 'NULLISH_LAST',
): (a: T, b: T) => number {
	return (a, b) => {
		const aValue = selector(a);
		const bValue = selector(b);
		const aNullish = aValue === null || aValue === undefined;
		const bNullish = bValue === null || bValue === undefined;

		if (aNullish && bNullish) {
			return 0;
		}
		if (aNullish) {
			return nullishPosition === 'NULLISH_LAST' ? 1 : -1;
		}
		if (bNullish) {
			return nullishPosition === 'NULLISH_LAST' ? -1 : 1;
		}

		return direction === 'DESCENDING' ? bValue - aValue : aValue - bValue;
	};
}
