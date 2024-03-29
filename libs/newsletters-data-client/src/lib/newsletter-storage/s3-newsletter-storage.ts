import type { S3Client } from '@aws-sdk/client-s3';
import type { DraftNewsletterDataWithMeta } from '../schemas/draft-newsletter-data-type';
import { makeBlankMeta } from '../schemas/meta-data-type';
import type {
	NewsletterData,
	NewsletterDataWithMeta,
	NewsletterDataWithoutMeta,
} from '../schemas/newsletter-data-type';
import { isNewsletterDataWithMeta } from '../schemas/newsletter-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import { StorageRequestFailureReason } from '../storage-response-types';
import type { UserProfile } from '../user-profile';
import { NewsletterStorage } from './NewsletterStorage';
import { objectToNewsletter } from './objectToNewsletter';
import {
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
		draft: DraftNewsletterDataWithMeta,
		user: UserProfile,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	> {
		const draftReady = isNewsletterDataWithMeta(draft);

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

		const newNewsletter: NewsletterDataWithMeta = {
			...draft,
			listId: nextId,
			meta: this.updateMetaForLaunch(draft.meta, user),
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
			data: this.stripMeta(newNewsletter),
		};
	}

	delete(
		listId: number,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	> {
		// todo - implement this. We don't want to delete published newsletters - we will probably move them to a deleted folder
		//  this function is not exposed in the API layer; not required for MVP. Deletion will be an engineering task where required.
		return Promise.resolve({
			ok: false,
			message: 'not implemented',
			reason: undefined,
		});
	}

	async list(): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta[]>
		| UnsuccessfulStorageResponse
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

			const listWithoutMeta = data.map(this.stripMeta);

			return {
				ok: true,
				data: listWithoutMeta,
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

	async read(
		listId: number,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	> {
		const newsletter = await this.fetchNewsletter(listId);

		if (!newsletter) {
			return {
				ok: false,
				message: `failed to read newsletter with id ${listId}`,
			};
		}
		return {
			ok: true,
			data: this.stripMeta(newsletter),
		};
	}

	async readWithMeta(
		listId: number,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithMeta>
		| UnsuccessfulStorageResponse
	> {
		const newsletter = await this.fetchNewsletter(listId);
		if (!newsletter) {
			return {
				ok: false,
				message: `failed to read newsletter with id ${listId}`,
			};
		}
		if (!isNewsletterDataWithMeta(newsletter)) {
			return {
				ok: false,
				message: `newsletter with id ${listId} was missing meta data`,
			};
		}
		return {
			ok: true,
			data: newsletter,
		};
	}

	async readByName(
		identityName: string,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	> {
		const newsletter = await this.fetchNewsletterByName(identityName);
		if (!newsletter) {
			return {
				ok: false,
				message: `failed to read newsletter with name '${identityName}'`,
			};
		}

		return {
			ok: true,
			data: this.stripMeta(newsletter),
		};
	}

	async readByNameWithMeta(
		identityName: string,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithMeta>
		| UnsuccessfulStorageResponse
	> {
		const newsletter = await this.fetchNewsletterByName(identityName);
		if (!newsletter) {
			return {
				ok: false,
				message: `failed to read newsletter with name '${identityName}'`,
			};
		}
		if (!isNewsletterDataWithMeta(newsletter)) {
			return {
				ok: false,
				message: `newsletter with name '${identityName}' was missing meta data`,
			};
		}
		return {
			ok: true,
			data: newsletter,
		};
	}

	async update(
		listId: number,
		modifications: Partial<NewsletterData>,
		user: UserProfile,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	> {
		const modificationError = this.getModificationError(modifications);

		if (modificationError) return modificationError;

		const newsletterToUpdate = await this.fetchNewsletter(listId);
		if (!newsletterToUpdate) {
			return {
				ok: false,
				message: `failed to read newsletter with id ${listId}`,
			};
		}
		const updatedNewsletter: NewsletterDataWithMeta = {
			...newsletterToUpdate,
			...modifications,
			meta: this.updateMeta(newsletterToUpdate.meta ?? makeBlankMeta(), user),
		};
		const identifier = `${updatedNewsletter.identityName}:${updatedNewsletter.listId}.json`;

		try {
			await this.putObject(updatedNewsletter, identifier);
			return {
				ok: true,
				data: this.stripMeta(updatedNewsletter),
			};
		} catch (err) {
			return {
				ok: false,
				message: `failed to update newsletter with id ${listId}`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}
	}

	async replace(
		listId: number,
		newsletter: NewsletterData,
		user: UserProfile,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	> {
		const newsletterToUpdate = await this.fetchNewsletter(listId);
		if (!newsletterToUpdate) {
			return {
				ok: false,
				message: `failed to read newsletter with id ${listId}`,
			};
		}

		if (
			newsletter.identityName !== newsletterToUpdate.identityName ||
			newsletter.listId !== newsletterToUpdate.listId
		) {
			console.error(
				`newsletter identityName or listId mismatch for newsletter with id ${listId}`,
			);
			throw new Error(
				`newsletter identityName or listId mismatch for newsletter with id ${listId}`,
			);
		}

		const { identityName } = newsletterToUpdate;
		const updatedNewsletter: NewsletterDataWithMeta = {
			...newsletter,
			identityName,
			listId,
			meta: this.updateMeta(newsletterToUpdate.meta ?? makeBlankMeta(), user),
		};

		const identifier = `${identityName}:${listId}.json`;

		try {
			await this.putObject(updatedNewsletter, identifier);
			return {
				ok: true,
				data: this.stripMeta(updatedNewsletter),
			};
		} catch (err) {
			return {
				ok: false,
				message: `failed to update newsletter with id ${listId}`,
				reason: StorageRequestFailureReason.S3Failure,
			};
		}
	}

	private async fetchNewsletter(
		listId: number,
	): Promise<NewsletterDataWithMeta | NewsletterDataWithoutMeta | undefined> {
		const listOfObjectsKeys = await this.getListOfObjectsKeys();
		const matchingKey = listOfObjectsKeys.find((key) => {
			const keyParts = key.split(':').pop();
			const id = keyParts?.split('.')[0];
			return id === listId.toString();
		});

		if (!matchingKey) {
			return undefined;
		}
		const s3Object = await this.fetchObject(matchingKey);
		const responseAsNewsletter: NewsletterData | undefined =
			await objectToNewsletter(s3Object);
		return responseAsNewsletter as
			| NewsletterDataWithMeta
			| NewsletterDataWithoutMeta
			| undefined;
	}

	private async fetchNewsletterByName(
		identityName: string,
	): Promise<NewsletterDataWithMeta | NewsletterDataWithoutMeta | undefined> {
		const listOfObjectsKeys = await this.getListOfObjectsKeys();
		const matchingKey = listOfObjectsKeys.find((key) => {
			const keyParts = key.split('/').pop();
			const name = keyParts?.split(':')[0];
			return name === identityName;
		});

		if (!matchingKey) {
			return undefined;
		}
		const s3Object = await this.fetchObject(matchingKey);
		const responseAsNewsletter: NewsletterData | undefined =
			await objectToNewsletter(s3Object);
		return responseAsNewsletter as
			| NewsletterDataWithMeta
			| NewsletterDataWithoutMeta
			| undefined;
	}

	private fetchObject = fetchObject(this);
	private putObject = putObject(this);
	private objectExists = objectExists(this);
	private getListOfObjectsKeys = getListOfObjectsKeys(this);

	getModificationError = NewsletterStorage.prototype.getModificationError;
	buildNoItemError = NewsletterStorage.prototype.buildNoItemError;
	stripMeta = NewsletterStorage.prototype.stripMeta;
	createNewMeta = NewsletterStorage.prototype.createNewMeta;
	updateMeta = NewsletterStorage.prototype.updateMeta;
	updateMetaForLaunch = NewsletterStorage.prototype.updateMetaForLaunch;
}
