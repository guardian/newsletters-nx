import type { DraftStorage } from '../draft-storage';
import type { UserProfile } from '../user-profile';

export class DraftService {
	draftStorage: DraftStorage;
	userProfile: UserProfile;

	constructor(draftStorage: DraftStorage, userProfile: UserProfile) {
		this.draftStorage = draftStorage;
		this.userProfile = userProfile;
	}
}
