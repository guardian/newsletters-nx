import { isPartialNewsletterData } from '../newsletter-data-type';
import type {
	DraftNewsletterData,
	MetaData,
	NewsletterData,
	NewsletterDataWithMeta,
	NewsletterDataWithoutMeta,
} from '../newsletter-data-type';
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
		draft: DraftNewsletterData,
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

	abstract readByName(
		identityName: string,
	): Promise<
		| SuccessfulStorageResponse<NewsletterDataWithoutMeta>
		| UnsuccessfulStorageResponse
	>;

	abstract update(
		listId: number,
		modifications: Partial<NewsletterData>,
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
		return {
			...data,
			meta: undefined,
		};
	}

	createNewMeta(user: UserProfile): MetaData {
		const now = Date.now();
		return {
			creationTimestamp: now,
			createdBy: user.email ?? '[unknown]',
			updatedTimestamp: now,
			updatedBy: user.email ?? '[unknown]',
		};
	}

	updateMeta(meta: MetaData, user: UserProfile): MetaData {
		const now = Date.now();
		return {
			...meta,
			updatedTimestamp: now,
			updatedBy: user.email ?? '[unknown]',
		};
	}
}
