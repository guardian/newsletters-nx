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
		extraValues: Partial<NewsletterData>,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		const { draftStorage, newsletterStorage } = this;
		const draftGetResponse = await draftStorage.getDraftNewsletter(draftId);
		if (!draftGetResponse.ok) {
			return draftGetResponse;
		}

		const draftPopulatedWithDefaults: DraftNewsletterData =
			withDefaultNewsletterValuesAndDerivedFields(draftGetResponse.data);

		const draftWithDefaultsThenExtraValues: DraftNewsletterData = {
			...draftPopulatedWithDefaults,
			...extraValues,
		};

		const newsletterCreateResponse = await newsletterStorage.create(
			draftWithDefaultsThenExtraValues,
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
