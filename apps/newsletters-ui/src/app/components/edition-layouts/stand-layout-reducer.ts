import type { Layout } from '@newsletters-nx/newsletters-data-client';
import { deleteNewsletterFromGroup } from '../../lib/modify-layout';

type FeedbackType = 'success' | 'failure';
// Add `append-newsletter` (#877) and `move-newsletter-to` (#878) here.
export type StandLayoutAction =
	| { type: 'remove-newsletter'; groupIndex: number; newsletterIndex: number }
	| { type: 'cancel' }
	| { type: 'set-pending' }
	| { type: 'handle-server-response'; success: boolean };
export type StandLayoutState = {
	layout: Layout;
	original: Layout;
	updateInProgress: boolean;
	feedback?: FeedbackType;
};
export const makeStandLayoutState = (original: Layout): StandLayoutState => ({
	layout: original,
	original,
	updateInProgress: false,
});
export function standLayoutReducer(
	state: StandLayoutState,
	action: StandLayoutAction,
): StandLayoutState {
	switch (action.type) {
		case 'set-pending':
			return { ...state, updateInProgress: true, feedback: undefined };
		case 'handle-server-response':
			return {
				...state,
				updateInProgress: false,
				feedback: action.success ? 'success' : 'failure',
				// A published layout becomes the new baseline for Cancel.
				original: action.success ? state.layout : state.original,
			};
	}
	if (state.updateInProgress) {
		return state;
	}
	switch (action.type) {
		case 'remove-newsletter':
			return {
				...state,
				feedback: undefined,
				layout: deleteNewsletterFromGroup(
					structuredClone(state.layout),
					action.groupIndex,
					action.newsletterIndex,
				),
			};
		case 'cancel':
			return { ...state, layout: state.original, feedback: undefined };
	}
}
