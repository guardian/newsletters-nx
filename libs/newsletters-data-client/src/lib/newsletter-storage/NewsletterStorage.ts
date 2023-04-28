import { isPartialNewsletterData } from '../newsletter-data-type';
import type {
	DraftNewsletterData,
	NewsletterData,
} from '../newsletter-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import { StorageRequestFailureReason } from '../storage-response-types';

export const IMMUTABLE_PROPERTIES: Readonly<string[]> = [
	'listId',
	'identityName',
];

export abstract class NewsletterStorage {
	abstract create(
		draft: DraftNewsletterData,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	>;

	abstract read(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	>;

	abstract readByName(
		identityName: string,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	>;

	abstract update(
		listId: number,
		modifications: Partial<NewsletterData>,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	>;

	abstract delete(
		listId: number,
	): Promise<SuccessfulStorageResponse<string> | UnsuccessfulStorageResponse>;

	abstract list(): Promise<
		SuccessfulStorageResponse<NewsletterData[]> | UnsuccessfulStorageResponse
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
}
