import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderRequestTagCreationMessage } from '../components/RequestSignUpPageCreationMessage';
import { getMessageConfig } from '../message-config';
import type {
	MessageAboutNewsletterParams,
	MessageConfig,
	MessageContent,
} from '../types';

export function buildSignUpPageCreationRequestMessage(
	params: MessageAboutNewsletterParams,
	emailEnvInfo: EmailEnvInfo,
): { content: MessageContent; messageConfig: MessageConfig } {
	const { newsletter } = params;
	const messageConfig = getMessageConfig(
		['central.production@guardian.co.uk'],
		emailEnvInfo,
	);

	const pageLink = `${messageConfig.toolHost}/launched/edit/${newsletter.identityName}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const content = renderRequestTagCreationMessage({
		pageLink,
		newsletter,
	}) as MessageContent;

	return { content, messageConfig };
}
