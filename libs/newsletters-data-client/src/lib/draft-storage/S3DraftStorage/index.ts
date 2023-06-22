import type { S3Client } from '@aws-sdk/client-s3';
import { makeBlankMeta } from '../../meta-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../../storage-response-types';
import { StorageRequestFailureReason } from '../../storage-response-types';
import type { UserProfile } from '../../user-profile';
import type {
	DraftWithId,
	DraftWithIdAndMeta,
	DraftWithIdButNoMeta,
	DraftWithoutId,
} from '../DraftStorage';
import { DraftStorage } from '../DraftStorage';
import { errorToResponse } from './errorToResponse';
import { objectToDraftWithMetaAndId } from './objectToDraftWithId';
import {
	deleteObject,
	fetchObject,
	getListOfObjectsKeys,
	putDraftObject,
} from './s3Functions';

export class S3DraftStorage extends DraftStorage {
	readonly s3Client: S3Client;
	readonly bucketName: string;
	readonly STORAGE_FOLDER = 'draft-storage/';

	constructor(bucketName: string, s3Client: S3Client) {
		super();
		this.bucketName = bucketName;
		this.s3Client = s3Client;
	}

	async create(
		draft: DraftWithoutId,
		user: UserProfile,
	): Promise<
		| SuccessfulStorageResponse<DraftWithIdButNoMeta>
		| UnsuccessfulStorageResponse
	> {
		try {
			const nextId = await this.getNextId();
			await this.putDraftObject({
				...draft,
				creationTimeStamp: Date.now(),
				listId: nextId,
				meta: this.createNewMeta(user),
			});

			//fetching the data from s3 again to make sure the put worked. Is this necessary?
			const getObjectOutput = await this.fetchObject(this.listIdToKey(nextId));
			const newDraft = await objectToDraftWithMetaAndId(getObjectOutput);
			if (!newDraft) {
				return {
					ok: false,
					message: `failed to put and retrieve ${
						draft.name ?? 'UNNAMED DRAFT'
					}.`,
					reason: StorageRequestFailureReason.S3Failure,
				};
			}

			return {
				ok: true,
				data: this.stripMeta(newDraft),
			};
		} catch (err) {
			return errorToResponse(err, draft.listId);
		}
	}

	async readAll(): Promise<
		| UnsuccessfulStorageResponse
		| SuccessfulStorageResponse<DraftWithIdButNoMeta[]>
	> {
		try {
			const listOfKeys = await this.getListOfObjectsKeys();
			const data: DraftWithIdButNoMeta[] = [];
			await Promise.all(
				listOfKeys.map(async (key) => {
					const output = await this.fetchObject(key);
					const draft = await objectToDraftWithMetaAndId(output);
					if (draft) {
						data.push(this.stripMeta(draft));
					}
				}),
			);

			return {
				ok: true,
				data,
			};
		} catch (err) {
			return errorToResponse(err);
		}
	}

	async read(
		listId: number,
	): Promise<
		| SuccessfulStorageResponse<DraftWithIdButNoMeta>
		| UnsuccessfulStorageResponse
	> {
		try {
			const key = this.listIdToKey(listId);
			const object = await this.fetchObject(key);
			const draft = await objectToDraftWithMetaAndId(object);

			if (!draft) {
				return {
					ok: false,
					message: `file ${key} was not a valid draft.`,
					reason: StorageRequestFailureReason.DataInStoreNotValid,
				};
			}

			return {
				ok: true,
				data: this.stripMeta(draft),
			};
		} catch (err) {
			return errorToResponse(err, listId);
		}
	}

	async update(
		draft: DraftWithId,
		user: UserProfile,
	): Promise<
		| SuccessfulStorageResponse<DraftWithIdButNoMeta>
		| UnsuccessfulStorageResponse
	> {
		try {
			// fetch the exsting draft in order to read the meta data
			const key = this.listIdToKey(draft.listId);
			const object = await this.fetchObject(key);
			const existingDraft = await objectToDraftWithMetaAndId(object);

			if (!existingDraft?.meta) {
				console.warn(
					`Did not get valid meta data for ${key} - creating new meta data`,
				);
			}

			const draftWithMetaAndId: DraftWithIdAndMeta = {
				...draft,
				meta: this.updateMeta(existingDraft?.meta ?? makeBlankMeta(), user),
			};

			await this.putDraftObject(draftWithMetaAndId);

			//fetching the data from s3 again to make sure the put worked. Is this necessary?
			const getObjectOutput = await this.fetchObject(
				this.listIdToKey(draft.listId),
			);
			const updatedDraft = await objectToDraftWithMetaAndId(getObjectOutput);

			if (!updatedDraft) {
				return {
					ok: false,
					message: `failed to update and retireve ${
						draft.name ?? 'UNNAMED DRAFT'
					}.`,
					reason: StorageRequestFailureReason.S3Failure,
				};
			}

			return {
				ok: true,
				data: this.stripMeta(updatedDraft),
			};
		} catch (err) {
			return errorToResponse(err, draft.listId);
		}
	}

	async deleteItem(
		listId: number,
	): Promise<
		| SuccessfulStorageResponse<DraftWithIdButNoMeta>
		| UnsuccessfulStorageResponse
	> {
		try {
			const key = this.listIdToKey(listId);
			const getObjectOutput = await this.fetchObject(key);
			const draftToDelete = await objectToDraftWithMetaAndId(getObjectOutput);

			if (!draftToDelete) {
				return {
					ok: false,
					message: `file ${key} was not a valid draft.`,
					reason: StorageRequestFailureReason.DataInStoreNotValid,
				};
			}

			await this.deleteObject(key);

			return {
				ok: true,
				data: this.stripMeta(draftToDelete),
			};
		} catch (err) {
			return errorToResponse(err, listId);
		}
	}

	private async getNextId(): Promise<number> {
		const listOfKeys = await this.getListOfObjectsKeys();
		const listOfIds = listOfKeys.map((key) => this.keyToListId(key));
		const highestId = listOfIds.reduce<number>(
			(previousValue, currentValue) => {
				if (typeof currentValue === 'undefined') {
					return previousValue;
				}
				return Math.max(previousValue, currentValue);
			},
			0,
		);
		return highestId + 1;
	}

	listIdToKey(listId: number): string {
		return `${this.STORAGE_FOLDER}${listId}.json`;
	}

	keyToListId(key: string): number | undefined {
		const { STORAGE_FOLDER } = this;
		if (!key.startsWith(STORAGE_FOLDER) || !key.endsWith('.json')) {
			return undefined;
		}
		const idPart = key.substring(
			STORAGE_FOLDER.length,
			key.length - '.json'.length,
		);
		const listId = Number(idPart);

		if (isNaN(listId)) {
			return undefined;
		}
		return listId;
	}

	private putDraftObject = putDraftObject(this);
	private getListOfObjectsKeys = getListOfObjectsKeys(this);
	private fetchObject = fetchObject(this);
	private deleteObject = deleteObject(this);

	stripMeta = DraftStorage.prototype.stripMeta;
	createNewMeta = DraftStorage.prototype.createNewMeta;
	updateMeta = DraftStorage.prototype.updateMeta;
}
