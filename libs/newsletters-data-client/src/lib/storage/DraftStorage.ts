import type { DraftNewsletterData } from '../newsletter-data-type';
import { isDraftNewsletterData } from '../newsletter-data-type';

export type DraftWithoutId = DraftNewsletterData & { listId: undefined };
export type DraftWithId = DraftNewsletterData & { listId: number };

export const isDraft = isDraftNewsletterData;

export enum StorageRequestFailureReason {
	NotFound,
	InvalidDataInput,
	DataInStoreNotValid,
	S3Failure,
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
