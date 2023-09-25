import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderRequestTagAndSignUpPageCreationMessage } from '../components/RenderTagAndSignUpPageCreationMessage';
import { getMessageConfig } from '../message-config';
import type {
	MessageAboutNewsletterParams,
	MessageConfig,
	MessageContent,
} from '../types';

export async function buildSignupPageAndTagCreationRequestMessage(
	params: MessageAboutNewsletterParams,
	emailEnvInfo: EmailEnvInfo,
): Promise<{ content: MessageContent; messageConfig: MessageConfig }> {
	const { newsletter } = params;
	const messageConfig = await getMessageConfig(
		emailEnvInfo,
		'CENTRAL_PRODUCTION_TAGS_AND_SIGNUP_PAGE_REQUEST',
	);

	const pageLink = `${messageConfig.toolHost}/launched/edit/${newsletter.identityName}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const content = renderRequestTagAndSignUpPageCreationMessage({
		pageLink,
		newsletter,
	}) as MessageContent;

	return { content, messageConfig };
}
