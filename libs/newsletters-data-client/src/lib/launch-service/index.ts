import type { DraftStorage } from '../draft-storage';
import { withDefaultNewsletterValuesAndDerivedFields } from '../draft-to-newsletter';
import type {
	DraftNewsletterData,
	NewsletterData,
} from '../newsletter-data-type';
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

		const populatedDraft: DraftNewsletterData =
			withDefaultNewsletterValuesAndDerivedFields(draftGetResponse.data);

		const newsletterCreateResponse = await newsletterStorage.create(
			populatedDraft,
		);
		if (!newsletterCreateResponse.ok) {
			return newsletterCreateResponse;
		}

		// TODO - should we actually delete the draft or archive it / mark as launched?
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
