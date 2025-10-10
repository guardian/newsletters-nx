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
        type: 'redo';
    } | {
        type: 'reset';
    }

export type LayoutState = {
    feedback?: FeedbackType;
    updateInProgress: boolean;
    selectedNewsletter?: string;
    history: [Layout, ...Layout[]];
    redoStack: Layout[];
    original: Layout;
}

const MAX_HISTORY_LENGTH = 30;

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
    const addToHistory = (layout: Layout): LayoutState['history'] => [layout, ...state.history].slice(0, MAX_HISTORY_LENGTH + 1) as LayoutState['history'];

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
                history: addToHistory(addNewGroup(current, action.index ?? current.groups.length)),
                redoStack: [],
            }
        case "update-group":
            return {
                ...state,
                history: addToHistory(updateLayoutGroup(current, action.groupIndex, action.mod)),
                redoStack: [],
            }
        case "remove-newsletter":
            return {
                ...state,
                history: addToHistory(deleteNewsletterFromGroup(current, action.groupIndex, action.newsletterIndex)),
                redoStack: [],
            }
        case "insert-newsletter":
            return !state.selectedNewsletter ? state : {
                ...state,
                history: addToHistory(insertNewsletterIntoGroup(current, action.groupIndex, action.insertIndex, state.selectedNewsletter)),
                selectedNewsletter: undefined,
                redoStack: [],
            }
        case "delete-group":
            return {
                ...state,
                history: addToHistory(deleteGroup(current, action.groupIndex)),
                redoStack: [],
            }
        case "move-newsletter-back":
            return {
                ...state,
                history: addToHistory(moveNewsletterTo(current, action.groupIndex, action.newsletterIndex, action.newsletterIndex - 1)),
                redoStack: [],
            }
        case "move-newsletter-forward":
            return {
                ...state,
                history: addToHistory(moveNewsletterTo(current, action.groupIndex, action.newsletterIndex, action.newsletterIndex + 1)),
                redoStack: [],
            }
        case "undo":
            if (state.history.length < 2) {
                return state
            }
            return {
                ...state,
                history: state.history.slice(1) as LayoutState['history'],
                redoStack: [state.history[0], ...state.redoStack]
            }
        case "redo": {
            const [mostRecentRedo] = state.redoStack;
            if (!mostRecentRedo) {
                return state
            }
            return {
                ...state,
                history: [mostRecentRedo, ...state.history],
                redoStack: state.redoStack.slice(1)
            }
        }
        case "reset":
            if (state.history.length === 1) {
                return state
            }
            return {
                ...state,
                history: [state.original],
                redoStack: [],
            }
    }
}