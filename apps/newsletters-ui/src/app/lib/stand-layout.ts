/** Keeps the pinned count and list header above the rows scrolling beneath them. */
export const layer = {
	stickyContent: 1,
} as const;

/** Height of the "N newsletters" count and the gap below it. */
export const countBlockHeight = '2.125rem';

/**
 * Distance from the top of the scrolling area to the top of the list, so the
 * list header can pin below the count without either knowing the other's size.
 */
export const listHeaderOffsetProperty = '--all-newsletters-list-header-offset';
