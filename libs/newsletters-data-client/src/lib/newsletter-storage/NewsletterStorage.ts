import type { DraftNewsletterDataWithMeta } from '../schemas/draft-newsletter-data-type';
import type { MetaData } from '../schemas/meta-data-type';
import {
	createNewMeta,
	stripMeta,
	updateMeta,
} from '../schemas/meta-data-type';
import type {
	NewsletterData,
	NewsletterDataWithMeta,
	NewsletterDataWithoutMeta,
} from '../schemas/newsletter-data-type';
import { isPartialNewsletterData } from '../schemas/newsletter-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import { StorageRequestFailureReason } from '../storage-response-types';
import type { UserProfile } from '../user-profile';

export const IMMUTABLE_PROPERTIES: Readonly<string[]> = [
	'listId',
	'identityName',
];

export abstract class NewsletterStorage {
	abstract create(
		draft: DraftNewsletterDataWithMeta,
		user: UserProfile,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract read(
		listId: number,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract readWithMeta(
		listId: number,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract readByName(
		identityName: string,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract update(
		listId: number,
		modifications: Partial<NewsletterData>,
		user: UserProfile,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract replace(
		listId: number,
		newsletter: NewsletterData,
		user: UserProfile,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract delete(
		listId: number,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract list(): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta[]>
		| UnsuccessfulStorageResponse
	>;

	getModificationError(
		modifications: Partial<NewsletterData>,
	): UnsuccessfulStorageResponse | undefined {
		const problems: string[] = [];
		const propertiesChanged = Object.keys(modifications);

		const forbiddenKeyChanges = propertiesChanged.filter((property) =>
			IMMUTABLE_PROPERTIES.includes(property),
		);

		if (forbiddenKeyChanges.length > 0) {
			problems.push(
				`Cannot change ${forbiddenKeyChanges
					.map((key) => `"${key}"`)
					.join(' or ')} on a newsletter.`,
			);
		}

		if (!isPartialNewsletterData(modifications)) {
			problems.push(
				'Not all fields are of the required type or in the right format.',
			);
		}

		if (problems.length === 0) {
			return undefined;
		}
		return {
			ok: false,
			message: problems.join(' '),
			reason: StorageRequestFailureReason.InvalidDataInput,
		};
	}

	buildNoItemError(
		listIdOrIdentityName: string | number,
	): UnsuccessfulStorageResponse {
		const message =
			typeof listIdOrIdentityName === 'number'
				? `No item with listId #${listIdOrIdentityName} found.`
				: `No item with identityName "${listIdOrIdentityName}" found.`;

		return {
			ok: false,
			message,
			reason: StorageRequestFailureReason.NotFound,
		};
	}

	stripMeta(
		data: NewsletterDataWithMeta | NewsletterData,
	): NewsletterDataWithoutMeta {
		return stripMeta(data);
	}

	createNewMeta(user: UserProfile): MetaData {
		return createNewMeta(user);
	}

	updateMeta(meta: MetaData, user: UserProfile): MetaData {
		return updateMeta(meta, user);
	}
	updateMetaForLaunch(meta: MetaData, user: UserProfile): MetaData {
		return updateMeta(meta, user, true);
	}
}
