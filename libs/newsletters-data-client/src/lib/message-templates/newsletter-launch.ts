import type { Email } from '@newsletters-nx/email-service';
import type { NewsletterData } from '../newsletter-data-type';
import type { UserProfile } from '../user-profile';

export const makeNewsletterLaunchEmail = (
	newsletter: NewsletterData,
	profile: UserProfile,
): Email => {
	const message = {
		recipients: [
			'newsletterPeeps@Grauniad.org',
			'central-production@Grauniad.org',
		],
		subject: `New newsletters launch: ${newsletter.name}`,
		body: `Deer all,

		Pleeze noot that a new newsletter has been created by ${
			profile.name ?? 'ANONYMOUS_USER'
		}:
		 - identityName = ${newsletter.identityName}

		 It will need some tags created.

		regards
		the newsleters tool.
		*******
		`,
	};

	return message;
};
