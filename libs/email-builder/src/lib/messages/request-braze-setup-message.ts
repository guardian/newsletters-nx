import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderBrazeSetupRequestMessage } from '../components/RequestBrazeSetUpMessage';
import { getMessageConfig } from '../message-config';
import type {
	MessageAboutNewsletterParams,
	MessageConfig,
	MessageContent,
} from '../types';

export async function buildBrazeSetUpRequestMessage(
	params: MessageAboutNewsletterParams,
	emailEnvInfo: EmailEnvInfo,
): Promise<{ content: MessageContent; messageConfig: MessageConfig }> {
	const { newsletter } = params;
	const messageConfig = await getMessageConfig(
		emailEnvInfo,
		'BRAZE_SET_UP_REQUEST',
	);

	const pageLink = `${messageConfig.toolHost}/launched/edit/${newsletter.identityName}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const content = renderBrazeSetupRequestMessage({
		pageLink,
		newsletter,
	}) as MessageContent;

	return { content, messageConfig };
}
