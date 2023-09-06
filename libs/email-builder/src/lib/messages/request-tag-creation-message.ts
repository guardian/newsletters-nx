import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderRequestTagCreationMessage } from '../components/RequestTagCreationMessage';
import { getMessageConfig } from '../message-config';
import type {
	MessageConfig,
	MessageContent,
	RequestTagCreationMessageParams,
} from '../types';

export function buildTagCreationRequestMessage(
	params: RequestTagCreationMessageParams,
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
