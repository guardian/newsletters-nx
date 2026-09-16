import type { MetaData } from '../schemas/meta-data-type';
import { makeBlankMeta } from '../schemas/meta-data-type';
import { StorageRequestFailureReason } from '../storage-response-types';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import type { UserProfile } from '../user-profile';
import { createNewDraftMeta, updateDraftMeta } from './DraftStorage';
import type {
	DraftStorage,
	DraftWithId,
	DraftWithIdAndMeta,
	DraftWithoutId,
} from './DraftStorage';

// TODO - serialise Drafts before returning
// so objects in memory can't be directly modified outside the Storage
export class InMemoryDraftStorage implements DraftStorage {
	private memory: DraftWithIdAndMeta[];

	constructor(drafts?: Array<DraftWithId & { meta?: MetaData }>) {
		this.memory = drafts
			? drafts.map((n) => ({
					...n,
					meta: n.meta ?? makeBlankMeta(),
				}))
			: [];
	}

	create(draft: DraftWithoutId, user: UserProfile) {
		const newDraftWithListIdAndMeta: DraftWithIdAndMeta = {
			...draft,
			listId: this.getNextId(),
			creationTimeStamp: Date.now(),
			meta: this.createNewMeta(user),
		};

		this.memory.push(newDraftWithListIdAndMeta);
		const response: SuccessfulStorageResponse<DraftWithIdAndMeta> = {
			ok: true,
			data: newDraftWithListIdAndMeta,
		};
		return Promise.resolve(response);
	}

	read(listId: number) {
		const match = this.memory.find((draft) => draft.listId === listId);

		if (!match) {
			const response: UnsuccessfulStorageResponse = {
				ok: false,
				message: `No draft with listId ${listId} found.`,
				reason: StorageRequestFailureReason.NotFound,
			};
			return Promise.resolve(response);
		}

		const response: SuccessfulStorageResponse<DraftWithIdAndMeta> = {
			ok: true,
			data: match,
		};
		return Promise.resolve(response);
	}

	update(changeToDraft: DraftWithId, user: UserProfile) {
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

		const updatedDraft: DraftWithIdAndMeta = {
			...match,
			...changeToDraft,
			meta: this.updateMeta(match.meta, user),
		};

		this.memory.splice(this.memory.indexOf(match), 1, updatedDraft);
		const response: SuccessfulStorageResponse<DraftWithIdAndMeta> = {
			ok: true,
			data: updatedDraft,
		};
		return Promise.resolve(response);
	}

	deleteItem(listId: number) {
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
		const response: SuccessfulStorageResponse<DraftWithIdAndMeta> = {
			ok: true,
			data: match,
		};
		return Promise.resolve(response);
	}

	readAll() {
		const response: SuccessfulStorageResponse<DraftWithIdAndMeta[]> = {
			ok: true,
			data: this.memory.map((draft) => ({ ...draft })),
		};
		return Promise.resolve(response);
	}

	readAllWithMeta() {
		const response: SuccessfulStorageResponse<DraftWithIdAndMeta[]> = {
			ok: true,
			data: this.memory.map((draft) => ({ ...draft })),
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

	createNewMeta = createNewDraftMeta;
	updateMeta = updateDraftMeta;
}
