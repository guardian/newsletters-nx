import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { getMessageConfig } from '../message-config';
import type { MessageContent, NewDraftMessageParams } from '../types';

export function buildNewDraftEmail(
	params: NewDraftMessageParams,
	emailEnvInfo: EmailEnvInfo,
) {
	const { listId, newsletterName } = params;
	const messageConfig = getMessageConfig(
		['newsletters.dev@guardian.co.uk'],
		emailEnvInfo,
	);

	const infolink = `${messageConfig.toolHost}/drafts/${listId}`;

	const content: MessageContent = {
		subject: `New draft email created: ${newsletterName}`,
		html: `<h1>A new draft was created. You can see it on <a href="${infolink}">this page</a>.</h1>`,
		text: `A new draft was created. You can see it on this page: ${infolink}.`,
	};

	return { content, messageConfig };
}
