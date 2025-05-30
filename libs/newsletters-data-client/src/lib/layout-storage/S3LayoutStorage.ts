import type { S3Client } from '@aws-sdk/client-s3';
import {
	deleteObject,
	fetchObject,
	getListOfObjectsKeys,
	objectExists,
	putObject,
} from '../generic-s3-functions';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import { StorageRequestFailureReason } from '../storage-response-types';
import type { LayoutStorage } from './LayoutStorage';
import { objectToLayout } from './objectToLayout';
import type { EditionId, EditionsLayouts, Layout } from './types';
import { editionIdSchema, layoutSchema } from './types';

export class S3LayoutStorage implements LayoutStorage {
	readonly s3Client: S3Client;
	readonly bucketName: string;
	readonly OBJECT_PREFIX = 'layouts/';

	constructor(bucketName: string, s3Client: S3Client) {
		this.bucketName = bucketName;
		this.s3Client = s3Client;
	}

	async create(
		edition: EditionId,
		layout: Layout,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {		
		const parseResult = layoutSchema.safeParse(layout);
		if (!parseResult.success) {
			return {
				ok: false,
				message: 'layout in wrong format',
				reason: StorageRequestFailureReason.InvalidDataInput,
			};
		}

		try {
			const layoutWithSameKeyExists = await this.objectExists(
				this.editionIdToKey(edition),
			);
			if (layoutWithSameKeyExists) {
				return {
					ok: false,
					message: `Layout ${edition} already exists`,
					reason: StorageRequestFailureReason.InvalidDataInput,
				};
			}
		} catch (err) {
			return {
				ok: false,
				message: `failed to check if layout for ${edition} exists`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}

		return this.update(edition, layout);
	}

	async read(
		edition: EditionId,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {
		console.log('read', edition);

		try {
			const layout = await this.fetchLayout(edition);

			if (!layout) {
				return {
					ok: false,
					message: `failed to read layout with name '${edition}'`,
					reason: StorageRequestFailureReason.NotFound,
				};
			}

			return {
				ok: true,
				data: layout,
			};
		} catch (error) {
			console.error(error);
			return {
				ok: false,
				message: `failed to read layout for ${edition}`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}
	}
	async readAll(): Promise<
		SuccessfulStorageResponse<EditionsLayouts> | UnsuccessfulStorageResponse
	> {
		try {
			const listOfObjectsKeys = await this.getListOfObjectsKeys();
			const layouts: EditionsLayouts = {};
			await Promise.all(
				listOfObjectsKeys.map(async (key) => {
					const editionId = this.keyToEditionId(key);
					const s3Response = await this.fetchObject(key);
					const responseAsLayout = await objectToLayout(s3Response);
					if (responseAsLayout && editionId) {
						layouts[editionId] = responseAsLayout;
					}
				}),
			);

			return {
				ok: true,
				data: layouts,
			};
		} catch (error) {
			console.error(error);
			return {
				ok: false,
				message: `failed to list newsletters`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}
	}
	async update(
		edition: EditionId,
		layout: Layout,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {
		const filename = this.editionIdToFileName(edition);

		const parseResult = layoutSchema.safeParse(layout);
		if (!parseResult.success) {
			return {
				ok: false,
				message: 'layout in wrong format',
				reason: StorageRequestFailureReason.InvalidDataInput,
			};
		}

		try {
			try {
				await this.putObject(layout, filename);
			} catch (err) {
				return {
					ok: false,
					message: `failed update layout ${edition}.`,
					reason: StorageRequestFailureReason.S3Failure,
				};
			}
			return {
				ok: true,
				data: layout,
			};
		} catch (error) {
			console.error(error);
			return {
				ok: false,
				message: `failed to update newsletter ${edition}`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}
	}
	async delete(
		edition: EditionId,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {
		const key = this.editionIdToKey(edition);

		try {
			const layoutToDelete = await this.fetchLayout(edition);
			if (!layoutToDelete) {
				return {
					ok: false,
					message: `no layout for ${edition} to delete`,
					reason: StorageRequestFailureReason.NotFound,
				};
			}

			await this.deleteObject(key);
			return {
				ok: true,
				data: layoutToDelete,
			};
		} catch (err) {
			return {
				ok: false,
				message: `failed to delete layout for ${edition}`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}
	}

	private async fetchLayout(edition: EditionId): Promise<Layout | undefined> {
		const key = `${this.OBJECT_PREFIX}${edition}.json`;
		const s3Object = await this.fetchObject(key);
		return await objectToLayout(s3Object);
	}

	private keyToEditionId(key: string): EditionId | undefined {
		// format = 'layouts/UK.json'
		const unparsedEditionId = key.split('/').pop()?.split('.').shift();
		return editionIdSchema.safeParse(unparsedEditionId).data;
	}
	private editionIdToKey(edition: string) {
		return `${this.OBJECT_PREFIX}${this.editionIdToFileName(edition)}`;
	}
	private editionIdToFileName(edition: string) {
		return `${edition}.json`;
	}

	private fetchObject = fetchObject(this);
	private putObject = putObject(this);
	private objectExists = objectExists(this);
	private getListOfObjectsKeys = getListOfObjectsKeys(this);
	private deleteObject = deleteObject(this);
}
