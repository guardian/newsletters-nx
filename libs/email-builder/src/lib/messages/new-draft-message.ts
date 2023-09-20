import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderNewDraftMessage } from '../components/NewDraftMessage';
import { getMessageConfig } from '../message-config';
import type { MessageContent, NewDraftMessageParams } from '../types';

export async function buildNewDraftEmail(
	params: NewDraftMessageParams,
	emailEnvInfo: EmailEnvInfo,
) {
	const { draft } = params;
	const messageConfig = await getMessageConfig(
		emailEnvInfo,
		'NEW_DRAFT_CREATED',
	);

	console.log('messageConfig', messageConfig);
	const pageLink = `${messageConfig.toolHost}/drafts/${draft.listId}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const content = renderNewDraftMessage({
		pageLink,
		draft,
	}) as MessageContent;

	return { content, messageConfig };
}
