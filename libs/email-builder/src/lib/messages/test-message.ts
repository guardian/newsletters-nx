import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { getMessageConfig } from '../message-config';
import type { MessageContent, TestMessageParams } from '../types';

export const recipients = ['newsletters.dev@guardian.co.uk'];

export function buildTestEmail(
	params: TestMessageParams,
	emailEnvInfo: EmailEnvInfo,
) {
	const { newsletterId } = params;
	const messageConfig = getMessageConfig(recipients, emailEnvInfo);

	const updateLink = `${messageConfig.toolHost}/launched/edit/${newsletterId}`;

	const content: MessageContent = {
		subject: `TEST - Please Ignore: Newsletter ${newsletterId} requires some action - ${params.testTitle}`,
		html: `<h1>Do something useful to <a href="${updateLink}">this newsletter</a></h1>`,
		text: `Do something useful to Newsletter ${newsletterId}: ${updateLink}.`,
	};

	return { content, messageConfig };
}
