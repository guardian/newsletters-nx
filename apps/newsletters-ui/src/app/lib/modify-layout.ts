import type { Layout, LayoutGroup } from "@newsletters-nx/newsletters-data-client";

const makeBlankGroup = () => ({
    title: '',
    newsletters: []
})

export const updateLayoutGroup = (layout: Layout, groupIndex: number, groupMod: Partial<LayoutGroup>): Layout => {
    const groupToUpdate = layout.groups[groupIndex];
    if (!groupToUpdate) {
        console.warn('invalid groupIndex', groupIndex, layout)
        return layout
    }
    return {
        ...layout,
        groups: [
            ...layout.groups.slice(0, groupIndex),
            { ...groupToUpdate, ...groupMod },
            ...layout.groups.slice(groupIndex + 1)
        ]
    }
}

export const deleteNewsletterFromGroup = (layout: Layout, groupIndex: number, newsletterIndex: number): Layout => {
    const groupToUpdate = layout.groups[groupIndex];
    if (!groupToUpdate) {
        console.warn('invalid groupIndex', groupIndex, layout)
        return layout
    }
    return updateLayoutGroup(layout, groupIndex, {
        newsletters: [
            ...groupToUpdate.newsletters.slice(0, newsletterIndex),
            ...groupToUpdate.newsletters.slice(newsletterIndex + 1),
        ]
    })
}

export const insertNewsletterIntoGroup = (layout: Layout, groupIndex: number, newsletterIndex: number, newsletterId: string): Layout => {
    const groupToUpdate = layout.groups[groupIndex];
    if (!groupToUpdate) {
        console.warn('invalid groupIndex', groupIndex, layout)
        return layout
    }
    return updateLayoutGroup(layout, groupIndex, {
        newsletters: [
            ...groupToUpdate.newsletters.slice(0, newsletterIndex),
            newsletterId,
            ...groupToUpdate.newsletters.slice(newsletterIndex),
        ]
    })
}

export const addNewGroup = (layout: Layout, groupIndex: number): Layout => {
    return {
        ...layout,
        groups: [
            ...layout.groups.slice(0, groupIndex),
            makeBlankGroup(),
            ...layout.groups.slice(groupIndex),
        ]
    }
}

export const deleteGroup = (layout: Layout, groupIndexToInsertBefore: number): Layout => {
    return {
        ...layout,
        groups: [
            ...layout.groups.slice(0, groupIndexToInsertBefore),
            ...layout.groups.slice(groupIndexToInsertBefore + 1),
        ]
    }
}
