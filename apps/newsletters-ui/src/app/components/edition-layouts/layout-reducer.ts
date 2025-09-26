import type { Layout, LayoutGroup } from "@newsletters-nx/newsletters-data-client";
import { addNewGroup, deleteGroup, deleteNewsletterFromGroup, insertNewsletterIntoGroup, moveNewsletterTo, updateLayoutGroup } from "../../lib/modify-layout";

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
        type: 'move-newsletter-forward';
        groupIndex: number;
        newsletterIndex: number;
    } | {
        type: 'move-newsletter-back';
        groupIndex: number;
        newsletterIndex: number;
    } | {
        type: 'insert-newsletter';
        groupIndex: number;
        insertIndex: number;
    } | {
        type: 'undo';
    } | {
        type: 'reset';
    }

export type LayoutState = {
    feedback?: FeedbackType;
    updateInProgress: boolean;
    selectedNewsletter?: string;
    history: [Layout, ...Layout[]];
    original: Layout;
}


export function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {

    switch (action.type) {
        case "select-newsletter":
        case "handle-server-response":
        case "set-pending":
            break;
        default:
            if (state.updateInProgress) {
                return state
            }
    }

    const current = structuredClone(state.history[0]);


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
                history: [addNewGroup(current, action.index ?? current.groups.length), ...state.history]
            }
        case "update-group":
            return {
                ...state,
                history: [updateLayoutGroup(current, action.groupIndex, action.mod), ...state.history]
            }
        case "remove-newsletter":
            return {
                ...state,
                history: [deleteNewsletterFromGroup(current, action.groupIndex, action.newsletterIndex), ...state.history]
            }
        case "insert-newsletter":
            return !state.selectedNewsletter ? state : {
                ...state,
                history: [insertNewsletterIntoGroup(current, action.groupIndex, action.insertIndex, state.selectedNewsletter), ...state.history],
                selectedNewsletter: undefined
            }
        case "delete-group":
            return {
                ...state,
                history: [deleteGroup(current, action.groupIndex), ...state.history]
            }
        case "move-newsletter-back":
            return {
                ...state,
                history: [moveNewsletterTo(current, action.groupIndex, action.newsletterIndex, action.newsletterIndex - 1), ...state.history]
            }
        case "move-newsletter-forward":
            return {
                ...state,
                history: [moveNewsletterTo(current, action.groupIndex, action.newsletterIndex, action.newsletterIndex + 1), ...state.history]
            }
        case "undo":
            if (state.history.length < 2) {
                return state
            }
            return {
                ...state,
                history: state.history.slice(1) as [Layout, ...Layout[]]
            }
        case "reset":
            if (state.history.length === 1) {
                return state
            }
            return {
                ...state,
                history: [state.original]
            }
    }
}