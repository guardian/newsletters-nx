import { StorageRequestFailureReason } from '../storage-response-types';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import type { DraftStorage, DraftWithId, DraftWithoutId } from './DraftStorage';

// TO DO - serialise Drafts before returning
// so objects in memory can't be directly modified outside the Storage
export class InMemoryDraftStorage implements DraftStorage {
	private memory: DraftWithId[];

	constructor(drafts?: DraftWithId[]) {
		this.memory = drafts ?? [];
	}

	createDraftNewsletter(draft: DraftWithoutId) {
		const newDraftWithListId: DraftWithId = {
			...draft,
			listId: this.getNextId(),
			creationTimeStamp: Date.now(),
		};
		this.memory.push(newDraftWithListId);
		const response: SuccessfulStorageResponse<DraftWithId> = {
			ok: true,
			data: newDraftWithListId,
		};
		return Promise.resolve(response);
	}

	getDraftNewsletter(listId: number) {
		const match = this.memory.find((draft) => draft.listId === listId);

		if (!match) {
			const response: UnsuccessfulStorageResponse = {
				ok: false,
				message: `No draft with listId ${listId} found.`,
				reason: StorageRequestFailureReason.NotFound,
			};
			return Promise.resolve(response);
		}
		const response: SuccessfulStorageResponse<DraftWithId> = {
			ok: true,
			data: match,
		};
		return Promise.resolve(response);
	}

	modifyDraftNewsletter(changeToDraft: DraftWithId) {
		const match = this.memory.find(
			(existingDraft) => existingDraft.listId === changeToDraft.listId,
		);

		if (!match) {
			const response: UnsuccessfulStorageResponse = {
				ok: false,
				message: `No draft with listId ${changeToDraft.listId} found.`,
				reason: StorageRequestFailureReason.NotFound,
			};
			return Promise.resolve(response);
		}

		const updatedDraft = {
			...match,
			...changeToDraft,
		};

		this.memory.splice(this.memory.indexOf(match), 1, updatedDraft);
		const response: SuccessfulStorageResponse<DraftWithId> = {
			ok: true,
			data: updatedDraft,
		};
		return Promise.resolve(response);
	}

	deleteDraftNewsletter(listId: number) {
		const match = this.memory.find((draft) => draft.listId === listId);

		if (!match) {
			const response: UnsuccessfulStorageResponse = {
				ok: false,
				message: `No draft with listId ${listId} found.`,
				reason: StorageRequestFailureReason.NotFound,
			};
			return Promise.resolve(response);
		}

		this.memory.splice(this.memory.indexOf(match), 1);
		const response: SuccessfulStorageResponse<DraftWithId> = {
			ok: true,
			data: match,
		};
		return Promise.resolve(response);
	}

	listDrafts() {
		const response: SuccessfulStorageResponse<DraftWithId[]> = {
			ok: true,
			data: [...this.memory],
		};
		return Promise.resolve(response);
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
