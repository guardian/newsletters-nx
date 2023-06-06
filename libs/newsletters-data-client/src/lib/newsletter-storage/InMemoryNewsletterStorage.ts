import type {
	DraftNewsletterData,
	MetaData,
	NewsletterData,
	NewsletterDataWithMeta,
	NewsletterDataWithoutMeta,
} from '../newsletter-data-type';
import { isNewsletterData } from '../newsletter-data-type';
import { StorageRequestFailureReason } from '../storage-response-types';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import { NewsletterStorage } from './NewsletterStorage';

const MOCK_META: MetaData = {
	updatedBy: 'system',
	creationTimestamp: 0,
	createdBy: 'system',
	updatedTimestamp: 0,
};

// TODO - serialise Drafts before returning
// so objects in memory can't be directly modified outside the Storage
export class InMemoryNewsletterStorage implements NewsletterStorage {
	private memory: NewsletterDataWithMeta[];

	constructor(newsletters?: NewsletterData[]) {
		this.memory = newsletters
			? newsletters.map((n) => ({
					...n,
					meta: MOCK_META,
			  }))
			: [];
	}

	create(draft: DraftNewsletterData) {
		// TODO - use the schema.safeParse and if the test fails,
		// use the list of issues to generate a message with the
		// wrong/missing fields listed.
		const draftReady = isNewsletterData(draft);
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
			meta: MOCK_META,
		};
		this.memory.push(newNewsletterWithNewId);

		const response: SuccessfulStorageResponse<NewsletterDataWithMeta> = {
			ok: true,
			data: newNewsletterWithNewId,
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

	update(listId: number, modifications: Partial<NewsletterDataWithoutMeta>) {
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
			meta: MOCK_META,
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
		const response: SuccessfulStorageResponse<NewsletterData> = {
			ok: true,
			data: match,
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
}
