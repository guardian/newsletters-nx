import type { Layout, LayoutGroup } from "@newsletters-nx/newsletters-data-client";
import { addNewGroup, deleteGroup, deleteNewsletterFromGroup, insertNewsletterIntoGroup, updateLayoutGroup } from "../../lib/modify-layout";

type FeedbackType = 'success' | 'failure'

export type LayoutAction =
    {
        type: 'set-pending';
    } |
    {
        type: 'select-newsletter';
        selectedNewsletter?: string;
    } |
    {
        type: 'handle-server-response';
        success: boolean;
    } | {
        type: 'add-group';
        index?: number;
    } | {
        type: 'delete-group';
        groupIndex: number;
    } | {
        type: 'update-group';
        groupIndex: number;
        mod: Partial<LayoutGroup>;
    } | {
        type: 'remove-newsletter';
        groupIndex: number;
        newsletterIndex: number;
    } | {
        type: 'insert-newsletter';
        groupIndex: number;
        insertIndex: number;
    }

export type LayoutState = {
    layout: Layout;
    feedback?: FeedbackType;
    updateInProgress: boolean;
    selectedNewsletter?: string;
}


export function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {


    switch (action.type) {
        case "select-newsletter":
        case "handle-server-response":
        case "set-pending":
            break;
        case "add-group":
        case "delete-group":
        case "update-group":
        case "remove-newsletter":
        case "insert-newsletter":
            if (state.updateInProgress) {
                return state
            }
    }


    switch (action.type) {
        case "set-pending":
            return {
                ...state,
                updateInProgress: true
            }
        case "select-newsletter":
            return {
                ...state,
                selectedNewsletter: action.selectedNewsletter
            }
        case "handle-server-response":
            return {
                ...state,
                updateInProgress: false,
                feedback: action.success ? 'success' : 'failure'
            }
        case "add-group":
            return {
                ...state,
                layout: addNewGroup(state.layout, action.index ?? state.layout.groups.length)
            }
        case "update-group":
            return {
                ...state,
                layout: updateLayoutGroup(state.layout, action.groupIndex, action.mod)
            }
        case "remove-newsletter":
            return {
                ...state,
                layout: deleteNewsletterFromGroup(state.layout, action.groupIndex, action.newsletterIndex)
            }
        case "insert-newsletter":
            return !state.selectedNewsletter ? state : {
                ...state,
                layout: insertNewsletterIntoGroup(state.layout, action.groupIndex, action.insertIndex, state.selectedNewsletter),
                selectedNewsletter: undefined
            }
        case "delete-group":
            return {
                ...state,
                layout: deleteGroup(state.layout, action.groupIndex)
            }
    }
}