import type { DraftNewsletterData } from '../schemas/draft-newsletter-data-type';
import type { MetaData } from '../schemas/meta-data-type';
import {
	createNewMeta,
	stripMeta,
	updateMeta,
} from '../schemas/meta-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import type { UserProfile } from '../user-profile';

export type DraftWithoutId = DraftNewsletterData & { listId: undefined };
export type DraftWithId = DraftNewsletterData & { listId: number };

export type DraftWithIdAndMeta = DraftNewsletterData & {
	listId: number;
	meta: MetaData;
};

export type DraftWithIdButNoMeta = DraftNewsletterData & {
	listId: number;
	meta: undefined;
};

export abstract class DraftStorage {
	abstract create(
		draft: DraftWithoutId,
		user: UserProfile,
	): Promise<
		| SuccessfulStorageResponse<DraftWithIdButNoMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract read(
		listId: number,
	): Promise<
		| SuccessfulStorageResponse<DraftWithIdButNoMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract readWithMeta(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<DraftWithIdAndMeta> | UnsuccessfulStorageResponse
	>;

	abstract update(
		draft: DraftWithId,
		user: UserProfile,
	): Promise<
		| SuccessfulStorageResponse<DraftWithIdButNoMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract deleteItem(
		listId: number,
	): Promise<
		| SuccessfulStorageResponse<DraftWithIdButNoMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract readAll(): Promise<
		| SuccessfulStorageResponse<DraftWithIdButNoMeta[]>
		| UnsuccessfulStorageResponse
	>;

	stripMeta(data: DraftWithIdAndMeta): DraftWithIdButNoMeta {
		return stripMeta(data);
	}

	createNewMeta(user: UserProfile): MetaData {
		return createNewMeta(user);
	}

	updateMeta(meta: MetaData, user: UserProfile): MetaData {
		return updateMeta(meta, user);
	}
}
