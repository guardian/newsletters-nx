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

// Moves a newsletter (from wherever it is in the layout) so it is inserted at
// `toIndex` in the target group's current list, i.e. before the item now at that index.
// Returns the same layout if the newsletter or group is missing or nothing would change.
export const moveNewsletter = (
	layout: Layout,
	newsletterId: string,
	toGroupIndex: number,
	toIndex: number,
): Layout => {
	const fromGroupIndex = layout.groups.findIndex((group) =>
		group.newsletters.includes(newsletterId),
	);
	const fromIndex =
		layout.groups[fromGroupIndex]?.newsletters.indexOf(newsletterId) ?? -1;
	if (fromIndex < 0 || !layout.groups[toGroupIndex]) {
		return layout;
	}
	const sameGroup = fromGroupIndex === toGroupIndex;
	// Removing the newsletter first shifts later items in the same group up by one.
	const insertAt = sameGroup && toIndex > fromIndex ? toIndex - 1 : toIndex;
	if (sameGroup && insertAt === fromIndex) {
		return layout;
	}
	return insertNewsletterIntoGroup(
		deleteNewsletterFromGroup(layout, fromGroupIndex, fromIndex),
		toGroupIndex,
		insertAt,
		newsletterId,
	);
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
