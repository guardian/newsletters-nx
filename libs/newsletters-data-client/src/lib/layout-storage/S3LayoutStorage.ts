import type { S3Client } from '@aws-sdk/client-s3';
import {
	fetchObject,
	getListOfObjectsKeys,
	// objectExists,
	// putObject,
} from '../generic-s3-functions';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import { StorageRequestFailureReason } from '../storage-response-types';
import type { LayoutStorage } from './LayoutStorage';
import { objectToLayout } from './objectToLayout';
import type { EditionId, EditionsLayouts, Layout } from './types';
// import { layoutSchema } from './types';

export class S3LayoutStorage implements LayoutStorage {
	readonly s3Client: S3Client;
	readonly bucketName: string;
	readonly OBJECT_PREFIX = 'layouts/';

	constructor(bucketName: string, s3Client: S3Client) {
		this.bucketName = bucketName;
		this.s3Client = s3Client;
	}

	create(
		edition: EditionId,
		layout: Layout,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {
		console.log('create', edition, layout);
		throw new Error('Method not implemented.');
	}
	read(
		edition: EditionId,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {
		console.log('read', edition);
		throw new Error('Method not implemented.');
	}
	async readAll(): Promise<
		SuccessfulStorageResponse<EditionsLayouts> | UnsuccessfulStorageResponse
	> {
		try {
			const listOfObjectsKeys = await this.getListOfObjectsKeys();
			console.log(listOfObjectsKeys);

			const layouts: EditionsLayouts = {};

			await Promise.all(
				listOfObjectsKeys.map(async (key) => {
					console.log({ key });
					const s3Response = await this.fetchObject(key);
					const responseAsLayout = await objectToLayout(s3Response);
					console.log({ key, responseAsLayout });
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

	private fetchObject = fetchObject(this);
	// private putObject = putObject(this);
	// private objectExists = objectExists(this);
	private getListOfObjectsKeys = getListOfObjectsKeys(this);
}
