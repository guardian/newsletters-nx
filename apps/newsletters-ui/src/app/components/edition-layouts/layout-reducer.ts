import type { Layout } from "@newsletters-nx/newsletters-data-client";

type FeedbackType = 'success' | 'failure'

export type LayoutAction = {
    type: 'local-update';
    layout: Layout;
} |
{
    type: 'set-feedback';
    feedback: FeedbackType | undefined;
} |
{
    type: 'set-updating';
    updateInProgress: boolean;
} |
{
    type: 'select-newsletter';
    selectedNewsletter?: string;
}

export type LayoutState = {
    layout: Layout;
    feedback?: FeedbackType;
    updateInProgress: boolean;
    selectedNewsletter?: string;
}


export function layoutReducer(state: LayoutState, action: LayoutAction) {
    switch (action.type) {

        case "local-update":
            if (state.updateInProgress) {
                return state
            }
            return {
                ...state,
                layout: action.layout,
                feedback: undefined,
            }
        case "set-feedback":
            return {
                ...state,
                feedback: action.feedback
            }
        case "set-updating":
            return {
                ...state,
                updateInProgress: action.updateInProgress
            }
        case "select-newsletter": {
            return {
                ...state,
                selectedNewsletter: action.selectedNewsletter
            }
        }
    }
}