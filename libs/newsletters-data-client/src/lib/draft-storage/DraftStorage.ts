import type { MetaData } from '../meta-data-type';
import { createNewMeta, stripMeta, updateMeta } from '../meta-data-type';
import type {
	DraftNewsletterData,
	DraftNewsletterDataWithMeta,
	DraftNewsletterDataWithoutMeta,
} from '../newsletter-data-type';
import { isDraftNewsletterData } from '../newsletter-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import type { UserProfile } from '../user-profile';

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

	stripMeta(
		data: DraftNewsletterDataWithMeta | DraftNewsletterData,
	): DraftNewsletterDataWithoutMeta {
		return stripMeta(data);
	}

	createNewMeta(user: UserProfile): MetaData {
		return createNewMeta(user);
	}

	updateMeta(meta: MetaData, user: UserProfile): MetaData {
		return updateMeta(meta, user);
	}
}
