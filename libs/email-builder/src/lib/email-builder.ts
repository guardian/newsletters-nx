import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { getMessageConfig } from './message-config';
import type {
	MessageContent,
	NewDraftMessageParams,
	TestMessageParams,
} from './types';

export function buildTestEmail(
	params: TestMessageParams,
	emailEnvInfo: EmailEnvInfo,
) {
	const { newsletterId } = params;
	const messageConfig = getMessageConfig(
		['newsletters.dev@guardian.co.uk'],
		emailEnvInfo,
	);

	const updateLink = `${messageConfig.toolHost}/launched/edit/${newsletterId}`;

	const content: MessageContent = {
		subject: `TEST - Please Ignore: Newsletter ${newsletterId} requires some action - ${params.testTitle}`,
		html: `<h1>Do something useful to <a href="${updateLink}">this newsletter</a></h1>`,
		text: `Do something useful to Newsletter ${newsletterId}: ${updateLink}.`,
	};

	return { content, messageConfig };
}

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
