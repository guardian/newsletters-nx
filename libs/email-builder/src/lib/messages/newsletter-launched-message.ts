import type {
	EmailEnvInfo,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import { renderNewLaunchMessage } from '../components/NewLaunchMessage';
import { getMessageConfig } from '../message-config';
import type { MessageAboutNewsletterParams } from '../types';

export async function buildNewsLetterLaunchMessage(
	params: MessageAboutNewsletterParams,
	emailEnvInfo: EmailEnvInfo,
	user?: UserProfile,
) {
	const { newsletter } = params;
	const messageConfig = await getMessageConfig(
		emailEnvInfo,
		'NEWSLETTER_LAUNCH',
	);
	const pageLink = `${messageConfig.toolHost}/launched/${newsletter.identityName}`;

	const content = renderNewLaunchMessage({
		pageLink,
		newsletter,
		user,
	});

	return { content, messageConfig };
}
