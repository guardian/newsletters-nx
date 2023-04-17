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

	abstract read(
		listId: number,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	>;

	abstract update(
		modifications: Partial<NewsletterData> & { listId: number },
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
