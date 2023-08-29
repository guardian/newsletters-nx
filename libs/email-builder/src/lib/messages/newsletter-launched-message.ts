import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderNewLaunchMessage } from '../components/NewLaunchMessage';
import { getMessageConfig } from '../message-config';
import type { MessageContent, NewsletterLaunchedMessageParams } from '../types';

export function buildNewsLetterLaunchMessage(
	params: NewsletterLaunchedMessageParams,
	emailEnvInfo: EmailEnvInfo,
) {
	const { newsletter } = params;
	const messageConfig = getMessageConfig(
		['newsletters.dev@guardian.co.uk'],
		emailEnvInfo,
	);

	const pageLink = `${messageConfig.toolHost}/launched/${newsletter.identityName}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const content = renderNewLaunchMessage({
		pageLink,
		newsletter,
	}) as MessageContent;

	return { content, messageConfig };
}
