import type {
	GetObjectCommandOutput,
	ListObjectsCommandOutput,
	S3Client,
} from '@aws-sdk/client-s3';
import {
	DeleteObjectCommand,
	GetObjectCommand,
	ListObjectsCommand,
	NoSuchKey,
	PutObjectCommand,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import { isDraftNewsletterData } from '../newsletter-data-type';
import type {
	DraftWithId,
	DraftWithoutId,
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from './DraftStorage';
import { DraftStorage, StorageRequestFailureReason } from './DraftStorage';

export class S3DraftStorage extends DraftStorage {
	private s3Client: S3Client;
	private readonly bucketName: string;
	private readonly STORAGE_FOLDER = 'draft-storage/';

	constructor(bucketName: string, s3Client: S3Client) {
		super();
		this.bucketName = bucketName;
		this.s3Client = s3Client;
	}

	async createDraftNewsletter(
		draft: DraftWithoutId,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	> {
		try {
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
			const nextId = highestId + 1;

			const putObjectOutput = await this.putDraftObject({
				...draft,
				listId: nextId,
			});

			if (putObjectOutput.$metadata.httpStatusCode !== 200) {
				return {
					ok: false,
					message: `failed to put ${draft.name ?? 'UNNAMED DRAFT'} in Storage.`,
					reason: StorageRequestFailureReason.S3Failure,
				};
			}

			const key = this.listIdToKey(nextId);
			const getObjectOutput = await this.fetchObject(key);
			const newDraft = await this.objectToDraftWithId(getObjectOutput);

			if (!newDraft) {
				return {
					ok: false,
					message: `failed to put and retireve ${
						draft.name ?? 'UNNAMED DRAFT'
					}.`,
					reason: StorageRequestFailureReason.S3Failure,
				};
			}

			return {
				ok: true,
				data: newDraft,
			};
		} catch (err) {
			return this.errorToResponse(err, draft.listId);
		}
	}

	async listDrafts(): Promise<
		UnsuccessfulStorageResponse | SuccessfulStorageResponse<DraftWithId[]>
	> {
		try {
			const listOfKeys = await this.getListOfObjectsKeys();
			const data: DraftWithId[] = [];
			await Promise.all(
				listOfKeys.map(async (key) => {
					const output = await this.fetchObject(key);
					const draft = await this.objectToDraftWithId(output);
					if (draft) {
						data.push(draft);
					}
				}),
			);

			return {
				ok: true,
				data,
			};
		} catch (err) {
			return this.errorToResponse(err);
		}
	}

	async getDraftNewsletter(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	> {
		const key = this.listIdToKey(listId);

		try {
			const object = await this.fetchObject(key);
			const draft = await this.objectToDraftWithId(object);

			if (!draft) {
				return {
					ok: false,
					message: `file ${key} was not a valid draft.`,
					reason: StorageRequestFailureReason.DataInStoreNotValid,
				};
			}

			return {
				ok: true,
				data: draft,
			};
		} catch (err) {
			return this.errorToResponse(err, listId);
		}
	}

	async modifyDraftNewsletter(
		draft: DraftWithId,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	> {
		try {
			const putObjectOutput = await this.putDraftObject(draft);

			if (putObjectOutput.$metadata.httpStatusCode !== 200) {
				return {
					ok: false,
					message: `failed to put ${draft.name ?? 'UNNAMED DRAFT'} in Storage.`,
					reason: StorageRequestFailureReason.S3Failure,
				};
			}

			//fetching the data from s3 again to make sure the put worked. Is this necessary?
			const getObjectOutput = await this.fetchObject(
				this.listIdToKey(draft.listId),
			);
			const updatedDraft = await this.objectToDraftWithId(getObjectOutput);

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
				data: updatedDraft,
			};
		} catch (err) {
			return this.errorToResponse(err, draft.listId);
		}
	}

	async deleteDraftNewsletter(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	> {
		const key = this.listIdToKey(listId);

		try {
			const object = await this.fetchObject(key);
			const draftToDelete = await this.objectToDraftWithId(object);

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
				data: draftToDelete,
			};
		} catch (err) {
			return this.errorToResponse(err, listId);
		}
	}

	private listIdToKey(listId: number): string {
		return `${this.STORAGE_FOLDER}${listId}.json`;
	}

	private keyToListId(key: string): number | undefined {
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

	private async putDraftObject(draft: DraftWithId) {
		const key = this.listIdToKey(draft.listId);
		const body = JSON.stringify(draft);

		return await this.s3Client.send(
			new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: body,
			}),
		);
	}

	private async getListOfObjectsKeys() {
		const listOutput = await this.s3Client.send(
			new ListObjectsCommand({
				Bucket: this.bucketName,
				Prefix: this.STORAGE_FOLDER,
				MaxKeys: 500, // to do - multiple requests if > 500?
			}),
		);
		return this.listOutputToKeyArray(listOutput);
	}

	private async fetchObject(key: string) {
		return await this.s3Client.send(
			new GetObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			}),
		);
	}

	private async deleteObject(key: string) {
		return await this.s3Client.send(
			new DeleteObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			}),
		);
	}

	private async objectToDraftWithId(
		getObjectOutput: GetObjectCommandOutput,
	): Promise<DraftWithId | undefined> {
		try {
			const { Body } = getObjectOutput;
			const content = await Body?.transformToString();
			if (!content) {
				return undefined;
			}
			const parsedContent = JSON.parse(content) as unknown;
			if (!isDraftNewsletterData(parsedContent)) {
				return undefined;
			}
			if (typeof parsedContent.listId !== 'number') {
				return undefined;
			}
			return parsedContent as DraftWithId;
		} catch (err) {
			console.warn('objectToDraft failed');
			console.warn(err);
			return undefined;
		}
	}

	private listOutputToKeyArray(listOutput: ListObjectsCommandOutput): string[] {
		const { Contents = [] } = listOutput;
		return Contents.map((item) => item.Key).filter(
			(key) =>
				typeof key === 'string' && key.length > this.STORAGE_FOLDER.length,
		) as string[];
	}

	private errorToResponse(
		err: unknown,
		listId?: number,
	): UnsuccessfulStorageResponse {
		if (err instanceof NoSuchKey) {
			const message = listId
				? `draft with listId ${listId} does not exist.`
				: `requested item does not exist`;

			return {
				ok: false,
				message,
				reason: StorageRequestFailureReason.NotFound,
			};
		}

		if (err instanceof S3ServiceException) {
			// NOTE - the reason is not communicated to the UI as the "executeStep" functions
			// on the WizardStepLayoutButton only returns a string (not an error) in the event
			// of failure.
			if (err.name === 'ExpiredToken') {
				const message =
					'The tool does not have permissions to access the storage system. Please report this error.';
				return {
					ok: false,
					message,
					reason: StorageRequestFailureReason.NoCredentials,
				};
			}

			return {
				ok: false,
				message: err.message,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}

		const message = err instanceof Error ? err.message : 'UNKNOWN ERROR';
		return {
			ok: false,
			message,
		};
	}
}
