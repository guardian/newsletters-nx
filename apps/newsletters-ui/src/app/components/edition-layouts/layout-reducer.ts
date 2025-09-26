import type { Layout } from "@newsletters-nx/newsletters-data-client";

type FeedbackType = 'success' | 'failure'

export type LayoutAction = {
    type: 'replace';
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
    type: 'set-selected-newsletter';
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
        case "replace":
            return {
                ...state,
                layout: action.layout
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
        case "set-selected-newsletter": {
            return {
                ...state,
                selectedNewsletter: action.selectedNewsletter
            }
        }
    }
}