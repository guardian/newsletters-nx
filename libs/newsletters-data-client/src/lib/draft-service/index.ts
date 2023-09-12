import type { SESClient } from '@aws-sdk/client-ses';
import type { DraftStorage } from '../draft-storage';
import type { EmailEnvInfo } from '../types';
import type { UserProfile } from '../user-profile';

export class DraftService {
	draftStorage: DraftStorage;
	userProfile: UserProfile;
	emailClient: SESClient;
	emailEnvInfo: EmailEnvInfo;

	constructor(
		draftStorage: DraftStorage,
		userProfile: UserProfile,
		emailClent: SESClient,
		emailEnvInfo: EmailEnvInfo,
	) {
		this.draftStorage = draftStorage;
		this.userProfile = userProfile;
		this.emailClient = emailClent;
		this.emailEnvInfo = emailEnvInfo;
	}
}
