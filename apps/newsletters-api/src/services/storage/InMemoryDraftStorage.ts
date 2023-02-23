import type { ApiResponse } from '@newsletters-nx/newsletters-data-client';
import { makeErrorResponse, makeSuccessResponse } from '../../app/responses';
import type { DraftStorage, DraftWithId, DraftWithoutId } from './DraftStorage';

// TO DO - serialise Drafts before returning
// so objects in memory can't be directly modified outside the Storage
export class InMemoryDraftStorage implements DraftStorage {
	private memory: DraftWithId[];

	constructor(drafts?: DraftWithId[]) {
		this.memory = drafts ?? [];
	}

	createDraftNewsletter(draft: DraftWithoutId) {
		const newDraftWithListId = { ...draft, listId: this.getNextId() };
		this.memory.push(newDraftWithListId);
		return Promise.resolve(makeSuccessResponse(newDraftWithListId));
	}

	getDraftNewsletter(listId: number) {
		const match = this.memory.find((draft) => draft.listId === listId);

		if (!match) {
			return Promise.resolve(
				makeErrorResponse(
					`No draft with listId ${listId} found.`,
				) as ApiResponse<DraftWithId>,
			);
		}
		return Promise.resolve(makeSuccessResponse(match));
	}

	modifyDraftNewsletter(changeToDraft: DraftWithId) {
		const match = this.memory.find(
			(existingDraft) => existingDraft.listId === changeToDraft.listId,
		);

		if (!match) {
			return Promise.resolve(
				makeErrorResponse(
					`No draft with listId ${changeToDraft.listId} found.`,
				) as ApiResponse<DraftWithId>,
			);
		}

		const updatedDraft = {
			...match,
			...changeToDraft,
		};

		this.memory.splice(this.memory.indexOf(match), 1, updatedDraft);

		return Promise.resolve(makeSuccessResponse(updatedDraft));
	}

	deleteDraftNewsletter(listId: number): Promise<ApiResponse<DraftWithId>> {
		const match = this.memory.find((draft) => draft.listId === listId);

		if (!match) {
			return Promise.resolve(
				makeErrorResponse(
					`No draft with listId ${listId} found.`,
				) as ApiResponse<DraftWithId>,
			);
		}

		this.memory.splice(this.memory.indexOf(match), 1);

		return Promise.resolve(makeSuccessResponse(match));
	}

	listDrafts(): Promise<ApiResponse<DraftWithId[]>> {
		return Promise.resolve(makeSuccessResponse([...this.memory]));
	}

	private getNextId(): number {
		const currentHighestListId = this.memory.reduce<number>(
			(highestListIdSoFar, nextDraft) => {
				const { listId = 0 } = nextDraft;
				return Math.max(listId, highestListIdSoFar);
			},
			0,
		);
		return currentHighestListId + 1;
	}
}
