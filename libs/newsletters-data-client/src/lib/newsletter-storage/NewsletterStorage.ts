import type {
	DraftNewsletterData,
	NewsletterData,
} from '../newsletter-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';

export const UNCHANGABLE_PROPERTIES: Readonly<string[]> = [
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
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	>;

	abstract list(): Promise<
		SuccessfulStorageResponse<NewsletterData[]> | UnsuccessfulStorageResponse
	>;
}
