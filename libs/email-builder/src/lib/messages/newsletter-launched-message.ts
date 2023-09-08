import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderNewLaunchMessage } from '../components/NewLaunchMessage';
import { getMessageConfig } from '../message-config';
import type { MessageAboutNewsletterParams, MessageContent } from '../types';

const recipients = ['newsletters.dev@guardian.co.uk'];
export { recipients as newsletterLaunchedRecipients };

export async function buildNewsLetterLaunchMessage(
	params: MessageAboutNewsletterParams,
	emailEnvInfo: EmailEnvInfo,
) {
	const { newsletter } = params;
	const messageConfig = await getMessageConfig(
		emailEnvInfo,
		'NEWSLETTER_LAUNCH',
	);
	const pageLink = `${messageConfig.toolHost}/launched/${newsletter.identityName}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const content = renderNewLaunchMessage({
		pageLink,
		newsletter,
	}) as MessageContent;

	return { content, messageConfig };
}
