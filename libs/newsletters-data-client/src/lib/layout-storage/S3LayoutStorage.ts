import type { S3Client } from '@aws-sdk/client-s3';
import {
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
import {
	editionIdSchema,
	type EditionId,
	type EditionsLayouts,
	type Layout,
} from './types';

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
		try {
			const newIdentifier = `${edition}.json`;

			try {
				const layoutWithSameKeyExists = await this.objectExists(newIdentifier);
				if (layoutWithSameKeyExists) {
					return {
						ok: false,
						message: `Layout ${edition} already exists`,
						reason: StorageRequestFailureReason.DataInStoreNotValid,
					};
				}
			} catch (err) {
				return {
					ok: false,
					message: `failed to check if layout for ${edition} exists`,
					reason: StorageRequestFailureReason.S3Failure,
				};
			}

			try {
				await this.putObject(layout, newIdentifier);
			} catch (err) {
				return {
					ok: false,
					message: `failed create layout ${edition}.`,
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
				message: `failed to create newsletter ${edition}`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}
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
	update(
		edition: EditionId,
		layout: Layout,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {
		console.log('update', edition, layout);
		throw new Error('Method not implemented.');
	}
	delete(
		edition: EditionId,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {
		console.log('delete', edition);
		throw new Error('Method not implemented.');
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

	private fetchObject = fetchObject(this);
	private putObject = putObject(this);
	private objectExists = objectExists(this);
	private getListOfObjectsKeys = getListOfObjectsKeys(this);
}
