import type { Newsletter } from '../newsletter-type';

export type Draft = Partial<Newsletter>;
export type DraftWithoutId = Draft & { listId: undefined };
export type DraftWithId = Draft & { listId: number };

export type SuccessfulStorageResponse<T> = {
	ok: true;
	data: T;
};

export type UnsuccessfulStorageResponse = {
	ok: false;
	message: string;
};

export abstract class DraftStorage {
	abstract createDraftNewsletter(
		draft: DraftWithoutId,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	>;

	abstract getDraftNewsletter(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	>;

	abstract modifyDraftNewsletter(
		draft: DraftWithId,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	>;

	abstract deleteDraftNewsletter(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	>;

	abstract listDrafts(): Promise<
		SuccessfulStorageResponse<DraftWithId[]> | UnsuccessfulStorageResponse
	>;
}
