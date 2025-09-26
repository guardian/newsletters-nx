import type { Layout } from "@newsletters-nx/newsletters-data-client";

type FeedbackType = 'success' | 'failure'

export type LayoutAction = {
    type: 'local-update';
    layout: Layout;
} |
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
}

export type LayoutState = {
    layout: Layout;
    feedback?: FeedbackType;
    updateInProgress: boolean;
    selectedNewsletter?: string;
}


export function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
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
        case "set-pending":
            return {
                ...state,
                updateInProgress: true
            }
        case "select-newsletter": {
            return {
                ...state,
                selectedNewsletter: action.selectedNewsletter
            }
        }
        case "handle-server-response":
            return {
                ...state,
                updateInProgress: false,
                feedback: action.success ? 'success' : 'failure'
            }
    }
}