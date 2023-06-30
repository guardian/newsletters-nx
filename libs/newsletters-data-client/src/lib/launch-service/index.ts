import type { DraftNewsletterDataWithMeta } from '../draft-newsletter-data-type';
import type { DraftStorage } from '../draft-storage';
import { withDefaultNewsletterValuesAndDerivedFields } from '../draft-to-newsletter';
import type { NewsletterData } from '../newsletter-data-type';
import type { NewsletterStorage } from '../newsletter-storage';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import type { UserProfile } from '../user-profile';

export class LaunchService {
	draftStorage: DraftStorage;
	newsletterStorage: NewsletterStorage;
	userProfile: UserProfile;

	constructor(
		draftStorage: DraftStorage,
		newsletterStorage: NewsletterStorage,
		userProfile: UserProfile,
	) {
		this.draftStorage = draftStorage;
		this.newsletterStorage = newsletterStorage;
		this.userProfile = userProfile;
	}

	async launchDraft(
		draftId: number,
		extraValues: Partial<NewsletterData>,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		const { draftStorage, newsletterStorage } = this;
		const draftGetResponse = await draftStorage.readWithMeta(draftId);
		if (!draftGetResponse.ok) {
			return draftGetResponse;
		}

		const draftPopulatedWithDefaults: DraftNewsletterDataWithMeta = {
			...withDefaultNewsletterValuesAndDerivedFields(draftGetResponse.data),
			meta: draftGetResponse.data.meta,
		};

		const draftWithDefaultsThenExtraValues: DraftNewsletterDataWithMeta = {
			...draftPopulatedWithDefaults,
			...extraValues,
		};

		const newsletterCreateResponse = await newsletterStorage.create(
			draftWithDefaultsThenExtraValues,
			this.userProfile,
		);
		if (!newsletterCreateResponse.ok) {
			return newsletterCreateResponse;
		}

		// TO DO - should we actually delete the draft or archive it / mark as launched?
		const draftDeleteResponse = await draftStorage.deleteItem(draftId);
		if (!draftDeleteResponse.ok) {
			console.warn(
				`created newsletter: ${newsletterCreateResponse.data.identityName} with listId #${newsletterCreateResponse.data.listId}, but failed to delete the draft.`,
				draftDeleteResponse.message,
			);
		}
		return newsletterCreateResponse;
	}
}
