import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderBrazeSetupRequestMessage } from '../components/RequestBrazeSetUpMessage';
import { getMessageConfig } from '../message-config';
import type {
	MessageConfig,
	MessageContent,
	RequestBrazeSetUpMessageParams,
} from '../types';

export function buildBrazeSetUpRequestMessage(
	params: RequestBrazeSetUpMessageParams,
	emailEnvInfo: EmailEnvInfo,
): { content: MessageContent; messageConfig: MessageConfig } {
	const { newsletter } = params;
	const messageConfig = getMessageConfig(
		['newsletters.dev@guardian.co.uk'],
		emailEnvInfo,
	);

	const pageLink = `${messageConfig.toolHost}/launched/edit/${newsletter.identityName}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const content = renderBrazeSetupRequestMessage({
		pageLink,
		newsletter,
	}) as MessageContent;

	return { content, messageConfig };
}
