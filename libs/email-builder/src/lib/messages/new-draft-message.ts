import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { renderNewDraftMessage } from '../components/NewDraftMessage';
import { getMessageConfig } from '../message-config';
import type { MessageContent, NewDraftMessageParams } from '../types';

export function buildNewDraftEmail(
	params: NewDraftMessageParams,
	emailEnvInfo: EmailEnvInfo,
) {
	const { draft } = params;
	const messageConfig = getMessageConfig(
		['newsletters.dev@guardian.co.uk'],
		emailEnvInfo,
	);

	const pageLink = `${messageConfig.toolHost}/drafts/${draft.listId}`;

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- render the component
	const content = renderNewDraftMessage({
		pageLink,
		draft,
	}) as MessageContent;

	return { content, messageConfig };
}
