import type { DraftNewsletterData } from '../newsletter-data-type';
import { isDraftNewsletterData } from '../newsletter-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';

export type DraftWithoutId = DraftNewsletterData & { listId: undefined };
export type DraftWithId = DraftNewsletterData & { listId: number };

export const isDraft = isDraftNewsletterData;

export abstract class DraftStorage {
	abstract create(
		draft: DraftWithoutId,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	>;

	abstract read(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	>;

	abstract update(
		draft: DraftWithId,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	>;

	abstract deleteItem(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	>;

	abstract readAll(): Promise<
		SuccessfulStorageResponse<DraftWithId[]> | UnsuccessfulStorageResponse
	>;
}
