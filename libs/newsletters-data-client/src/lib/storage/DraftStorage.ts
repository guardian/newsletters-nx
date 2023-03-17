import type { NewsletterData } from '../newsletter-data-type';
import { ispartialNewsletterData } from '../newsletter-data-type';

export type Draft = Partial<NewsletterData>;
export type DraftWithoutId = Draft & { listId: undefined };
export type DraftWithId = Draft & { listId: number };

export const isDraft = ispartialNewsletterData;

export enum StorageRequestFailureReason {
	NotFound,
	InvalidDataInput,
}

export type SuccessfulStorageResponse<T> = {
	ok: true;
	data: T;
};

export type UnsuccessfulStorageResponse = {
	ok: false;
	message: string;
	reason?: StorageRequestFailureReason;
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
