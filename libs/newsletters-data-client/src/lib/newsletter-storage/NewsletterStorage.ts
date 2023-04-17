import type {
	DraftNewsletterData,
	NewsletterData,
} from '../newsletter-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';

export abstract class NewsletterStorage {
	abstract create(
		draft: DraftNewsletterData,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	>;

	abstract get(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	>;

	abstract modify(
		draft: NewsletterData,
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
