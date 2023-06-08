import type { EmailServiceAbstract } from '@newsletters-nx/email-service';
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
import type { UserProfile } from '../user-profile';

export class LaunchService {
	draftStorage: DraftStorage;
	newsletterStorage: NewsletterStorage;
	userProfile: UserProfile;
	emailService: EmailServiceAbstract;

	constructor(
		draftStorage: DraftStorage,
		newsletterStorage: NewsletterStorage,
		userProfile: UserProfile,
		emailService: EmailServiceAbstract,
	) {
		this.draftStorage = draftStorage;
		this.newsletterStorage = newsletterStorage;
		this.userProfile = userProfile;
		this.emailService = emailService;
	}

	async launchDraft(
		draftId: number,
		extraValues: Partial<NewsletterData>,
	): Promise<
		SuccessfulStorageResponse<NewsletterData> | UnsuccessfulStorageResponse
	> {
		const { draftStorage, newsletterStorage } = this;
		const draftGetResponse = await draftStorage.read(draftId);
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
			this.userProfile,
		);
		if (!newsletterCreateResponse.ok) {
			return newsletterCreateResponse;
		}

		const emailReport = await this.emailService.send(
			['newsletterPeeps@Grauniad.org', 'central-production@Grauniad.org'],
			`New newsletters launch: ${newsletterCreateResponse.data.name}`,
			`Deer all,

			Pleeze noot that a new newsletter has been created:
			 - identityName = ${newsletterCreateResponse.data.identityName}

			 It will need some tags created.

			regards
			the newsleters tool.
			`,
		);

		console.log(emailReport);

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
