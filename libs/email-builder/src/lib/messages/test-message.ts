import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { getMessageConfig } from '../message-config';
import type { MessageContent, TestMessageParams } from '../types';

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
