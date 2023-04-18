import type { DraftStorage } from '../draft-storage';
import type { NewsletterStorage } from '../newsletter-storage';

export class Launcheroo {
	draftStorage: DraftStorage;
	newsletterStorage: NewsletterStorage;

	constructor(
		draftStorage: DraftStorage,
		newsletterStorage: NewsletterStorage,
	) {
		this.draftStorage = draftStorage;
		this.newsletterStorage = newsletterStorage;
	}
}
