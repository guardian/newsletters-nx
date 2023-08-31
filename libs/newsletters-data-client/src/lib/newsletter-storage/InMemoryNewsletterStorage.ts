import type { DraftNewsletterDataWithMeta } from '../schemas/draft-newsletter-data-type';
import { makeBlankMeta } from '../schemas/meta-data-type';
import type {
	NewsletterData,
	NewsletterDataWithMeta,
	NewsletterDataWithoutMeta,
} from '../schemas/newsletter-data-type';
import { isNewsletterDataWithMeta } from '../schemas/newsletter-data-type';
import { StorageRequestFailureReason } from '../storage-response-types';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import type { UserProfile } from '../user-profile';
import { NewsletterStorage } from './NewsletterStorage';

// TODO - serialise Drafts before returning
// so objects in memory can't be directly modified outside the Storage
export class InMemoryNewsletterStorage implements NewsletterStorage {
	private memory: NewsletterDataWithMeta[];

	constructor(newsletters?: NewsletterData[]) {
		this.memory = newsletters
			? newsletters.map((n) => ({
					...n,
					meta: makeBlankMeta(),
			  }))
			: [];
	}

	create(draft: DraftNewsletterDataWithMeta, user: UserProfile) {
		// TODO - use the schema.safeParse and if the test fails,
		// use the list of issues to generate a message with the
		// wrong/missing fields listed.
		const draftReady = isNewsletterDataWithMeta(draft);
		if (!draftReady) {
			const error: UnsuccessfulStorageResponse = {
				ok: false,
				message: `draft was not ready to be live`,
				reason: StorageRequestFailureReason.InvalidDataInput,
			};
			return Promise.resolve(error);
		}

		const newsletterWithTheSameIdentityName = this.memory.find(
			(item) => item.identityName === draft.identityName,
		);
		if (newsletterWithTheSameIdentityName) {
			const error: UnsuccessfulStorageResponse = {
				ok: false,
				message: `draft has the same identityName (${newsletterWithTheSameIdentityName.identityName}) as newsletter #${newsletterWithTheSameIdentityName.listId}`,
				reason: StorageRequestFailureReason.InvalidDataInput,
			};
			return Promise.resolve(error);
		}

		const newNewsletterWithNewId: NewsletterDataWithMeta = {
			...draft,
			listId: this.getNextId(),
			meta: this.updateMetaForLaunch(draft.meta, user),
		};
		this.memory.push(newNewsletterWithNewId);

		const response: SuccessfulStorageResponse<NewsletterDataWithoutMeta> = {
			ok: true,
			data: this.stripMeta(newNewsletterWithNewId),
		};
		return Promise.resolve(response);
	}

	read(listId: number) {
		const match = this.memory.find(
			(newsletter) => newsletter.listId === listId,
		);

		if (!match) {
			return Promise.resolve(this.buildNoItemError(listId));
		}
		const response: SuccessfulStorageResponse<NewsletterDataWithoutMeta> = {
			ok: true,
			data: this.stripMeta(match),
		};
		return Promise.resolve(response);
	}

	readWithMeta(listId: number) {
		const match = this.memory.find(
			(newsletter) => newsletter.listId === listId,
		);

		if (!match) {
			return Promise.resolve(this.buildNoItemError(listId));
		}
		const response: SuccessfulStorageResponse<NewsletterDataWithMeta> = {
			ok: true,
			data: match,
		};
		return Promise.resolve(response);
	}

	readByName(identityName: string) {
		const match = this.memory.find(
			(newsletter) => newsletter.identityName === identityName,
		);
		if (!match) {
			return Promise.resolve(this.buildNoItemError(identityName));
		}
		const response: SuccessfulStorageResponse<NewsletterDataWithoutMeta> = {
			ok: true,
			data: this.stripMeta(match),
		};
		return Promise.resolve(response);
	}

	readByNameWithMeta(identityName: string) {
		const match = this.memory.find(
			(newsletter) => newsletter.identityName === identityName,
		);
		if (!match) {
			return Promise.resolve(this.buildNoItemError(identityName));
		}
		const response: SuccessfulStorageResponse<NewsletterDataWithMeta> = {
			ok: true,
			data: match,
		};
		return Promise.resolve(response);
	}

	update(
		listId: number,
		modifications: Partial<NewsletterDataWithoutMeta>,
		user: UserProfile,
	) {
		const modificationError = this.getModificationError(modifications);
		if (modificationError) {
			return Promise.resolve(modificationError);
		}

		const match = this.memory.find((item) => item.listId === listId);
		if (!match) {
			return Promise.resolve(this.buildNoItemError(listId));
		}

		const updatedItem: NewsletterDataWithMeta = {
			...match,
			...modifications,
			meta: this.updateMeta(match.meta, user),
		};
		this.memory.splice(this.memory.indexOf(match), 1, updatedItem);
		const response: SuccessfulStorageResponse<NewsletterDataWithoutMeta> = {
			ok: true,
			data: this.stripMeta(updatedItem),
		};
		return Promise.resolve(response);
	}

	async replace(
		listId: number,
		newsletter: NewsletterDataWithoutMeta,
		user: UserProfile,
	) {
		const match = this.memory.find((item) => item.listId === listId);
		if (!match) {
			return Promise.resolve(this.buildNoItemError(listId));
		}

		if (
			newsletter.identityName !== match.identityName ||
			newsletter.listId !== match.listId
		) {
			console.error(
				`newsletter identityName or listId mismatch for newsletter with id ${listId}`,
			);
			throw new Error(
				`newsletter identityName or listId mismatch for newsletter with id ${listId}`,
			);
		}

		const updatedItem: NewsletterDataWithMeta = {
			...newsletter,
			meta: this.updateMeta(match.meta, user),
		};
		this.memory.splice(this.memory.indexOf(match), 1, updatedItem);
		const response: SuccessfulStorageResponse<NewsletterDataWithoutMeta> = {
			ok: true,
			data: this.stripMeta(updatedItem),
		};
		return Promise.resolve(response);
	}

	delete(listId: number) {
		const match = this.memory.find((item) => item.listId === listId);

		if (!match) {
			return Promise.resolve(this.buildNoItemError(listId));
		}

		this.memory.splice(this.memory.indexOf(match), 1);
		const response: SuccessfulStorageResponse<NewsletterDataWithoutMeta> = {
			ok: true,
			data: this.stripMeta(match),
		};
		return Promise.resolve(response);
	}

	list() {
		const response: SuccessfulStorageResponse<NewsletterDataWithoutMeta[]> = {
			ok: true,
			data: [...this.memory].map(this.stripMeta).map((item) => ({ ...item })),
		};
		return Promise.resolve(response);
	}

	private getNextId(): number {
		const currentHighestListId = this.memory.reduce<number>(
			(highestListIdSoFar, nextDraft) => {
				const { listId = 0 } = nextDraft;
				return Math.max(listId, highestListIdSoFar);
			},
			0,
		);
		return currentHighestListId + 1;
	}

	getModificationError = NewsletterStorage.prototype.getModificationError;
	buildNoItemError = NewsletterStorage.prototype.buildNoItemError;
	stripMeta = NewsletterStorage.prototype.stripMeta;
	createNewMeta = NewsletterStorage.prototype.createNewMeta;
	updateMeta = NewsletterStorage.prototype.updateMeta;
	updateMetaForLaunch = NewsletterStorage.prototype.updateMetaForLaunch;
}
