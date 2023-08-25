import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderNewLaunchMessage } from '../components/NewLaunchMessage';
import { getMessageConfig } from '../message-config';
import type { MessageContent, NewsletterLaunchedMessageParams } from '../types';

export function buildNewsLetterLaunchMessage(
	params: NewsletterLaunchedMessageParams,
	emailEnvInfo: EmailEnvInfo,
) {
	const { identityName, name = '' } = params.newsletter;
	const messageConfig = getMessageConfig(
		['newsletters.dev@guardian.co.uk'],
		emailEnvInfo,
	);

	const pageLink = `${messageConfig.toolHost}/launched/${identityName}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const html = renderNewLaunchMessage({
		pageLink: pageLink,
		newsletter: params.newsletter,
	}) as string;

	const content: MessageContent = {
		subject: `New newsletters launched: ${name}`,
		html,
		text: `A new newsletter "${name}" has been launched: ${pageLink}.`,
	};

	return { content, messageConfig };
}
