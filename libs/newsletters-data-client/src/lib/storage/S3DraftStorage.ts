import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import {
	GetObjectCommand,
	ListObjectsCommand,
	NoSuchKey,
	S3Client,
} from '@aws-sdk/client-s3';
import { fromIni } from '@aws-sdk/credential-providers';
import { isDraftNewsletterData } from '../newsletter-data-type';
import type {
	DraftWithId,
	DraftWithoutId,
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from './DraftStorage';
import { DraftStorage, StorageRequestFailureReason } from './DraftStorage';

interface S3Params {
	region: string;
	profile: string;
	bucket: string;
}

export class S3DraftStorage extends DraftStorage {
	readonly params: S3Params;
	private s3Client: S3Client;
	private STORAGE_FOLDER = 'draft-storage/';

	constructor(params: S3Params) {
		super();
		this.params = params;
		this.s3Client = new S3Client({
			region: params.region,
			credentials: fromIni({ profile: params.profile }),
		});
	}

	createDraftNewsletter(
		draft: DraftWithoutId,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	> {
		throw new Error('Method not implemented.');
	}

	async listDrafts(): Promise<
		UnsuccessfulStorageResponse | SuccessfulStorageResponse<DraftWithId[]>
	> {
		try {
			const listOutput = await this.s3Client.send(
				new ListObjectsCommand({
					Bucket: this.params.bucket,
					Prefix: this.STORAGE_FOLDER,
					MaxKeys: 500, // to do - multiple requests if > 500?
				}),
			);
			const { Contents = [] } = listOutput;
			const listOfKeys = Contents.map((item) => item.Key).filter(
				(key) =>
					typeof key === 'string' && key.length > this.STORAGE_FOLDER.length,
			) as string[];

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
			const message = err instanceof Error ? err.message : 'UNKNOWN ERROR';
			return {
				ok: false,
				message,
			};
		}
	}

	async getDraftNewsletter(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	> {
		const key = `${this.STORAGE_FOLDER}${listId}.json`;

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
			if (err instanceof NoSuchKey) {
				return {
					ok: false,
					message: `draft with listId ${listId} does not exist.`,
					reason: StorageRequestFailureReason.NotFound,
				};
			}

			const message = err instanceof Error ? err.message : 'UNKNOWN ERROR';
			return {
				ok: false,
				message,
			};
		}
	}
	modifyDraftNewsletter(
		draft: DraftWithId,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	> {
		throw new Error('Method not implemented.');
	}
	deleteDraftNewsletter(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<DraftWithId> | UnsuccessfulStorageResponse
	> {
		throw new Error('Method not implemented.');
	}

	private async fetchObject(key: string) {
		return await this.s3Client.send(
			new GetObjectCommand({
				Bucket: this.params.bucket,
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
			const parsedContent = (content ? JSON.parse(content) : {}) as unknown;
			if (
				isDraftNewsletterData(parsedContent) &&
				typeof parsedContent.listId === 'number'
			) {
				return parsedContent as DraftWithId;
			}
			return undefined;
		} catch (err) {
			console.warn('objectToDraft failed');
			console.warn(err);
			return undefined;
		}
	}
}
