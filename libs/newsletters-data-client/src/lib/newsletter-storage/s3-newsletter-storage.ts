import type {S3Client} from '@aws-sdk/client-s3';
import {PutObjectCommand} from '@aws-sdk/client-s3';
import {NewsletterStorage} from '@newsletters-nx/newsletters-data-client';
import {isNewsletterData} from '../newsletter-data-type';
import type {
	DraftNewsletterData,
	NewsletterData,
} from '../newsletter-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import {objectToNewsletter} from "./objectToNewsletter";
import {fetchObject, getListOfObjectsKeys, getNextId, objectExists} from './s3-functions';

export class S3NewsletterStorage extends NewsletterStorage {
	readonly s3Client: S3Client;
	readonly bucketName: string;
	readonly OBJECT_PREFIX = 'launched-newsletters/';

	constructor(bucketName: string, s3Client: S3Client) {
		super();
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
				reason: undefined,
			};
			return Promise.resolve(error);
		}

		if (!draft.identityName) {
			return {
				ok: false,
				message: `identityName is undefined`,
				reason: undefined, // todo - add an appropriate type here
			};
		}

		const nextId = await getNextId(this);
		const newIdentifier = `${draft.identityName}:${nextId}.json`;

		try {
			const newsletterWithSameKeyExists = await this.objectExists(newIdentifier);
			if (newsletterWithSameKeyExists) {
				return {
					ok: false,
					message: `Newsletter with name ${newIdentifier} already exists`,
					reason: undefined, // todo - add an appropriate type here
				};
			}

		} catch (err) {
			return {
				ok: false,
				message: `failed to check if newsletter with name ${newIdentifier} exists`,
				reason: undefined, // todo - add an appropriate type here
			};
		}

		const newNewsletter: NewsletterData = {
			...draft,
			listId: nextId,
		};
		const createNewNewsletterCommand = new PutObjectCommand({
			Bucket: this.bucketName,
			Key: this.OBJECT_PREFIX + newIdentifier,
			Body: JSON.stringify(newNewsletter),
			ContentType: 'application/json',
		});

		try {
			await this.s3Client.send(createNewNewsletterCommand);
		} catch (err) {
			return {
				ok: false,
				message: `failed create newsletter ${draft.identityName}.`,
				reason: undefined, // add an appropriate type here
			};
		}

		return {
			ok: true,
			data: newNewsletter,
		};
	}

	delete(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		return Promise.resolve({
			ok: false,
			message: 'not implemented',
			reason: undefined,
		});
	}

	async list(): Promise<
		SuccessfulStorageResponse<NewsletterData[]> | UnsuccessfulStorageResponse
	> {
		try {
			const listOfObjectsKeys = await this.getListOfObjectsKeys();
			const data: NewsletterData[] =[];
			await Promise.all(
				listOfObjectsKeys.map(async (key) => {
					const s3Response = await this.fetchObject(key);
					const responseAsNewsletter = await objectToNewsletter(s3Response);
					if (responseAsNewsletter) {
						data.push(responseAsNewsletter);
					}
				})
			);
			return {
				ok: true,
				data,
			}
		} catch (error) {
			return {
				ok: false,
				message: `failed to list newsletters`,
				reason: undefined, // add an appropriate type here
			};
		}
	}

	read(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		return Promise.resolve({
			ok: false,
			message: 'not implemented',
			reason: undefined,
		});
	}

	readByName(
		identityName: string,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		return Promise.resolve({
			ok: false,
			message: 'not implemented',
			reason: undefined,
		});
	}

	update(
		listId: number,
		modifications: Partial<NewsletterData>,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		return Promise.resolve({
			ok: false,
			message: 'not implemented',
			reason: undefined,
		});
	}

	private fetchObject = fetchObject(this)
	private objectExists = objectExists(this)
	private getListOfObjectsKeys = getListOfObjectsKeys(this);
}
