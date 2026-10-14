import type {
	Layout,
	LayoutGroup,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';

// Cancelled newsletters wouldn't be shown on the site, so they can't be
// placed in a layout. Listed explicitly so any new status is excluded by default.
export const isAddableStatus = (status: NewsletterData['status']): boolean =>
	status === 'live' || status === 'pending' || status === 'paused';

const makeBlankGroup = () => ({
	title: '',
	newsletters: [],
});

export const updateLayoutGroup = (
	layout: Layout,
	groupIndex: number,
	groupMod: Partial<LayoutGroup>,
): Layout => {
	const groupToUpdate = layout.groups[groupIndex];
	if (!groupToUpdate) {
		console.warn('invalid groupIndex', groupIndex, layout);
		return layout;
	}
	return {
		...layout,
		groups: [
			...layout.groups.slice(0, groupIndex),
			{ ...groupToUpdate, ...groupMod },
			...layout.groups.slice(groupIndex + 1),
		],
	};
};

export const deleteNewsletterFromGroup = (
	layout: Layout,
	groupIndex: number,
	newsletterIndex: number,
): Layout => {
	const groupToUpdate = layout.groups[groupIndex];
	if (!groupToUpdate) {
		console.warn('invalid groupIndex', groupIndex, layout);
		return layout;
	}
	return updateLayoutGroup(layout, groupIndex, {
		newsletters: [
			...groupToUpdate.newsletters.slice(0, newsletterIndex),
			...groupToUpdate.newsletters.slice(newsletterIndex + 1),
		],
	});
};

export const moveNewsletterTo = (
	layout: Layout,
	groupIndex: number,
	newsletterIndex: number,
	newIndex: number,
): Layout => {
	const groupToUpdate = layout.groups[groupIndex];
	if (!groupToUpdate) {
		console.warn('invalid groupIndex', groupIndex, layout);
		return layout;
	}
	const newArray = [...groupToUpdate.newsletters];
	const newslettersToMove = newArray.splice(newsletterIndex, 1);

	return updateLayoutGroup(layout, groupIndex, {
		newsletters: [
			...newArray.slice(0, newIndex),
			...newslettersToMove,
			...newArray.slice(newIndex),
		],
	});
};

export const moveNewsletterToGroup = (
	layout: Layout,
	fromGroupIndex: number,
	newsletterId: string,
	toGroupIndex: number,
	newIndex: number,
): Layout => {
	const fromGroup = layout.groups[fromGroupIndex];
	if (
		fromGroupIndex === toGroupIndex ||
		!fromGroup?.newsletters.includes(newsletterId) ||
		!layout.groups[toGroupIndex]
	) {
		return layout;
	}
	const removed = deleteNewsletterFromGroup(
		layout,
		fromGroupIndex,
		fromGroup.newsletters.indexOf(newsletterId),
	);
	return insertNewsletterIntoGroup(
		removed,
		toGroupIndex,
		newIndex,
		newsletterId,
	);
};

// Converts a drop before/after a target into the indexes for moveNewsletterTo.
// Returns undefined if either id is missing or the drop wouldn't change the order.
export const getReorderIndex = (
	ids: string[],
	movedId: string,
	targetId: string,
	dropPosition: 'before' | 'after',
): { from: number; to: number } | undefined => {
	const from = ids.indexOf(movedId);
	const targetIndex = ids.indexOf(targetId);
	if (from < 0 || targetIndex < 0) {
		return undefined;
	}
	const insertAt = dropPosition === 'before' ? targetIndex : targetIndex + 1;
	// moveNewsletterTo takes the index in the list after the item is removed.
	const to = insertAt > from ? insertAt - 1 : insertAt;
	return to === from ? undefined : { from, to };
};

export const getInsertIndex = (
	ids: string[],
	targetId: string,
	dropPosition: 'before' | 'after' | 'on',
): number => {
	const targetIndex = ids.indexOf(targetId);
	if (targetIndex < 0) {
		return ids.length;
	}
	return dropPosition === 'before' ? targetIndex : targetIndex + 1;
};

export const insertNewsletterIntoGroup = (
	layout: Layout,
	groupIndex: number,
	newsletterIndex: number,
	newsletterId: string,
): Layout => {
	const groupToUpdate = layout.groups[groupIndex];
	if (!groupToUpdate) {
		console.warn('invalid groupIndex', groupIndex, layout);
		return layout;
	}
	return updateLayoutGroup(layout, groupIndex, {
		newsletters: [
			...groupToUpdate.newsletters.slice(0, newsletterIndex),
			newsletterId,
			...groupToUpdate.newsletters.slice(newsletterIndex),
		],
	});
};

export const addNewGroup = (layout: Layout, groupIndex: number): Layout => {
	return {
		...layout,
		groups: [
			...layout.groups.slice(0, groupIndex),
			makeBlankGroup(),
			...layout.groups.slice(groupIndex),
		],
	};
};

export const deleteGroup = (
	layout: Layout,
	groupIndexToInsertBefore: number,
): Layout => {
	return {
		...layout,
		groups: [
			...layout.groups.slice(0, groupIndexToInsertBefore),
			...layout.groups.slice(groupIndexToInsertBefore + 1),
		],
	};
};
