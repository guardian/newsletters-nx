import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderBrazeUpdateRequestMessage } from '../components/RequestBrazeUpdateMessage';
import { getMessageConfig } from '../message-config';
import type {
	MessageAboutNewsletterParams,
	MessageConfig,
	MessageContent,
} from '../types';

export async function buildBrazeUpdateRequestMessage(
	params: MessageAboutNewsletterParams,
	emailEnvInfo: EmailEnvInfo,
): Promise<{ content: MessageContent; messageConfig: MessageConfig }> {
	const { newsletter } = params;
	const messageConfig = await getMessageConfig(
		emailEnvInfo,
		'BRAZE_UPDATE_REQUEST',
	);

	const pageLink = `${messageConfig.toolHost}/launched/edit/${newsletter.identityName}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const content = renderBrazeUpdateRequestMessage({
		pageLink,
		newsletter,
	}) as MessageContent;

	return { content, messageConfig };
}
