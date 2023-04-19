import type { DraftStorage } from '../draft-storage';
import type { NewsletterData } from '../newsletter-data-type';
import type { NewsletterStorage } from '../newsletter-storage';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';

export class LaunchService {
	draftStorage: DraftStorage;
	newsletterStorage: NewsletterStorage;

	constructor(
		draftStorage: DraftStorage,
		newsletterStorage: NewsletterStorage,
	) {
		this.draftStorage = draftStorage;
		this.newsletterStorage = newsletterStorage;
	}

	async launchDraft(
		draftId: number,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		const { draftStorage, newsletterStorage } = this;
		const draftGetResponse = await draftStorage.getDraftNewsletter(draftId);
		if (!draftGetResponse.ok) {
			return draftGetResponse;
		}
		console.log(
			`got draft "${draftGetResponse.data.identityName ?? 'WITHOUT NAME'}"`,
		);

		const newsletterCreateResponse = await newsletterStorage.create(
			draftGetResponse.data,
		);
		if (!newsletterCreateResponse.ok) {
			return newsletterCreateResponse;
		}
		console.log(
			`created newsletter: ${newsletterCreateResponse.data.identityName} with listId #${newsletterCreateResponse.data.listId}`,
		);

		// TO DO - should we actually delete the draft or archive it / mark as launched?
		const draftDeleteResponse = await draftStorage.deleteDraftNewsletter(
			draftId,
		);
		if (!draftDeleteResponse.ok) {
			console.warn(
				`created newsletter: ${newsletterCreateResponse.data.identityName} with listId #${newsletterCreateResponse.data.listId}, but failed to delete the draft.`,
				draftDeleteResponse.message,
			);
		}
		return newsletterCreateResponse;
	}
}
