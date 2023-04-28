import type { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { isNewsletterData } from '../newsletter-data-type';
import type {
	DraftNewsletterData,
	NewsletterData,
} from '../newsletter-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import { StorageRequestFailureReason } from '../storage-response-types';
import { NewsletterStorage } from './NewsletterStorage';
import { objectToNewsletter } from './objectToNewsletter';
import {
	deleteObject,
	fetchObject,
	getListOfObjectsKeys,
	getNextId,
	objectExists,
	putObject,
} from './s3-functions';

export class S3NewsletterStorage implements NewsletterStorage {
	readonly s3Client: S3Client;
	readonly bucketName: string;
	readonly OBJECT_PREFIX = 'launched-newsletters/';

	constructor(bucketName: string, s3Client: S3Client) {
		this.bucketName = bucketName;
		this.s3Client = s3Client;
	}

	async create(
		draft: DraftNewsletterData,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		const draftReady = isNewsletterData(draft);

		if (!draftReady) {
			const error: UnsuccessfulStorageResponse = {
				ok: false,
				message: `draft was not ready to be live`,
				reason: StorageRequestFailureReason.InvalidDataInput,
			};
			return Promise.resolve(error);
		}

		if (!draft.identityName) {
			return {
				ok: false,
				message: `identityName is undefined`,
				reason: StorageRequestFailureReason.InvalidDataInput,
			};
		}

		const nextId = await getNextId(this);
		const newIdentifier = `${draft.identityName}:${nextId}.json`;

		try {
			const newsletterWithSameKeyExists = await this.objectExists(
				newIdentifier,
			);
			if (newsletterWithSameKeyExists) {
				return {
					ok: false,
					message: `Newsletter with name ${newIdentifier} already exists`,
					reason: StorageRequestFailureReason.DataInStoreNotValid,
				};
			}
		} catch (err) {
			return {
				ok: false,
				message: `failed to check if newsletter with name ${newIdentifier} exists`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}

		const newNewsletter: NewsletterData = {
			...draft,
			listId: nextId,
		};

		try {
			await this.putObject(newNewsletter, newIdentifier);
		} catch (err) {
			return {
				ok: false,
				message: `failed create newsletter ${draft.identityName}.`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}

		return {
			ok: true,
			data: newNewsletter,
		};
	}

	async delete(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<string> | UnsuccessfulStorageResponse
	> {
		const newsletterToDelete = await this.read(listId);
		if (!newsletterToDelete.ok) {
			return newsletterToDelete;
		}
		try {
			const { data: { listId, identityName } } = newsletterToDelete;
			const key = `${this.OBJECT_PREFIX}${identityName}:${listId}.json`;
			await this.deleteObject(key);
		} catch (error) {
			return {
				ok: false,
				message: `failed to delete newsletter with id ${listId}`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}
		return {
			ok: true,
			data: `newsletter with id ${listId} deleted`,
		}
	}

	async list(): Promise<
		SuccessfulStorageResponse<NewsletterData[]> | UnsuccessfulStorageResponse
	> {
		try {
			const listOfObjectsKeys = await this.getListOfObjectsKeys();
			const data: NewsletterData[] = [];
			await Promise.all(
				listOfObjectsKeys.map(async (key) => {
					const s3Response = await this.fetchObject(key);
					const responseAsNewsletter = await objectToNewsletter(s3Response);
					if (responseAsNewsletter) {
						data.push(responseAsNewsletter);
					}
				}),
			);
			return {
				ok: true,
				data,
			};
		} catch (error) {
			return {
				ok: false,
				message: `failed to list newsletters`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}
	}

	async read(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		const listOfObjectsKeys = await this.getListOfObjectsKeys();
		const matchingKey = listOfObjectsKeys.find((key) => {
			const keyParts = key.split(':').pop();
			const id = keyParts?.split('.')[0];
			return id === listId.toString();
		});
		if (matchingKey) {
			const s3Object = await this.fetchObject(matchingKey);
			const responseAsNewsletter = await objectToNewsletter(s3Object);
			if (responseAsNewsletter) {
				return {
					ok: true,
					data: responseAsNewsletter,
				};
			}
		}
		return {
			ok: false,
			message: `failed to read newsletter with id ${listId}`,
		};
	}

	async readByName(
		identityName: string,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		const listOfObjectsKeys = await this.getListOfObjectsKeys();
		const matchingKey = listOfObjectsKeys.find((key) => {
			const keyParts = key.split('/').pop();
			const name = keyParts?.split(':')[0];
			return name === identityName;
		});
		if (matchingKey) {
			const s3Object = await this.fetchObject(matchingKey);
			const responseAsNewsletter = await objectToNewsletter(s3Object);
			if (responseAsNewsletter) {
				return {
					ok: true,
					data: responseAsNewsletter,
				};
			}
		}
		return {
			ok: false,
			message: `failed to read newsletter with name ${identityName}`,
			reason: undefined, // add an appropriate type here
		};
	}

	async update(
		listId: number,
		modifications: Partial<NewsletterData>,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		const modificationError = this.getModificationError(modifications);
		if (modificationError) return modificationError;
		const newsletterToUpdate = await this.read(listId);

		if (!newsletterToUpdate.ok) {
			return newsletterToUpdate;
		}
		const updatedNewsletter = {
			...newsletterToUpdate.data,
			...modifications,
		};

		const updateNewsletterCommand = new PutObjectCommand({
			Bucket: this.bucketName,
			Key: `${this.OBJECT_PREFIX}${updatedNewsletter.identityName}:${updatedNewsletter.listId}.json`,
			Body: JSON.stringify(updatedNewsletter),
			ContentType: 'application/json',
		});

		try {
			await this.s3Client.send(updateNewsletterCommand);
			return {
				ok: true,
				data: updatedNewsletter,
			};
		} catch (err) {
			return {
				ok: false,
				message: `failed to update newsletter with id ${listId}`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}
	}

	private fetchObject = fetchObject(this);
	private putObject = putObject(this);
	private deleteObject = deleteObject(this);
	private objectExists = objectExists(this);
	private getListOfObjectsKeys = getListOfObjectsKeys(this);

	getModificationError = NewsletterStorage.prototype.getModificationError;
	buildNoItemError = NewsletterStorage.prototype.buildNoItemError;
}
