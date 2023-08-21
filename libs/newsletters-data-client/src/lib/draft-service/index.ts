import type { SESClient } from '@aws-sdk/client-ses';
import type { DraftStorage } from '../draft-storage';
import type { UserProfile } from '../user-profile';

export class DraftService {
	draftStorage: DraftStorage;
	userProfile: UserProfile;
	emailClient: SESClient;

	constructor(
		draftStorage: DraftStorage,
		userProfile: UserProfile,
		emailClent: SESClient,
	) {
		this.draftStorage = draftStorage;
		this.userProfile = userProfile;
		this.emailClient = emailClent;
	}
}
