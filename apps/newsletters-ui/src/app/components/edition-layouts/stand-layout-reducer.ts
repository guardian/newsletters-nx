import type { Layout } from '@newsletters-nx/newsletters-data-client';
import {
	addNewGroup,
	deleteGroup,
	deleteNewsletterFromGroup,
	insertNewsletterIntoGroup,
	moveNewsletter,
	renameGroup,
} from '../../lib/modify-layout';

export type StandLayoutAction =
	| { type: 'remove-newsletter'; groupIndex: number; newsletterIndex: number }
	| { type: 'append-newsletter'; groupIndex: number; newsletterId: string }
	| {
			type: 'move-newsletter';
			newsletterId: string;
			toGroupIndex: number;
			toIndex: number;
	  }
	| { type: 'set-pending' }
	| {
			type: 'add-section';
			insert: { place: 'before' | 'after'; groupIndex: number };
	  }
	| { type: 'request-delete-section'; groupIndex: number }
	| { type: 'cancel-delete-section' }
	| {
			type: 'confirm-delete-section';
	  }
	| {
			type: 'rename-section';
			groupIndex: number;
			name: string;
	  };

export type StandLayoutState = {
	layout: Layout;
	original: Layout;
	updateInProgress: boolean;
	confirmingDeletionOfSection?: number;
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
			return { ...state, updateInProgress: true };
		case 'append-newsletter': {
			const group = state.layout.groups[action.groupIndex];
			const isAssigned = state.layout.groups.some((g) =>
				g.newsletters.includes(action.newsletterId),
			);
			if (state.updateInProgress || !group || isAssigned) {
				return state;
			}
			return {
				...state,
				layout: insertNewsletterIntoGroup(
					state.layout,
					action.groupIndex,
					group.newsletters.length,
					action.newsletterId,
				),
			};
		}
		case 'move-newsletter': {
			const layout = moveNewsletter(
				state.layout,
				action.newsletterId,
				action.toGroupIndex,
				action.toIndex,
			);
			if (state.updateInProgress || layout === state.layout) {
				return state;
			}
			return { ...state, layout };
		}
		case 'remove-newsletter':
			if (state.updateInProgress) {
				return state;
			}
			return {
				...state,
				layout: deleteNewsletterFromGroup(
					state.layout,
					action.groupIndex,
					action.newsletterIndex,
				),
			};
		case 'add-section': {
			if (state.updateInProgress) {
				return state;
			}
			const insertOffset = action.insert.place === 'before' ? 0 : 1;
			const insertAt = action.insert.groupIndex + insertOffset;
			return {
				...state,
				layout: addNewGroup(state.layout, insertAt),
			};
		}

		case 'request-delete-section': {
			if (state.updateInProgress) {
				return state;
			}
			return {
				...state,
				confirmingDeletionOfSection: action.groupIndex,
			};
		}

		case 'cancel-delete-section': {
			if (state.updateInProgress) {
				return state;
			}

			return {
				...state,
				confirmingDeletionOfSection: undefined,
			};
		}

		case 'confirm-delete-section': {
			if (
				state.updateInProgress ||
				state.confirmingDeletionOfSection === undefined
			) {
				return state;
			}

			return {
				...state,
				confirmingDeletionOfSection: undefined,
				layout: deleteGroup(state.layout, state.confirmingDeletionOfSection),
			};
		}

		case 'rename-section': {
			if (state.updateInProgress) {
				return state;
			}

			return {
				...state,
				layout: renameGroup(state.layout, action.groupIndex, action.name),
			};
		}
	}
}
