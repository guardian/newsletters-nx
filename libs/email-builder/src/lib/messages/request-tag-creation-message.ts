import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderRequestTagCreationMessage } from '../components/RequestTagCreationMessage';
import { getMessageConfig } from '../message-config';
import type {
	MessageAboutNewsletterParams,
	MessageConfig,
	MessageContent,
} from '../types';

export async function buildTagCreationRequestMessage(
	params: MessageAboutNewsletterParams,
	emailEnvInfo: EmailEnvInfo,
): Promise<{ content: MessageContent; messageConfig: MessageConfig }> {
	const { newsletter } = params;
	const messageConfig = await getMessageConfig(
		emailEnvInfo,
		'TAG_CREATION_REQUEST',
	);

	const pageLink = `${messageConfig.toolHost}/launched/edit/${newsletter.identityName}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const content = renderRequestTagCreationMessage({
		pageLink,
		newsletter,
	}) as MessageContent;

	return { content, messageConfig };
}
