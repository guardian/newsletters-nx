import type { SendEmailCommandOutput, SESClient } from '@aws-sdk/client-ses';
import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { buildSendEmailCommand } from './build-send-email-command';
import { buildNewDraftEmail, buildTestEmail } from './email-builder';
import type { MessageTemplateId } from './types';

const getMessage = (
	messageTemplateId: MessageTemplateId,
	newsletterId: string,
	emailEnvInfo: EmailEnvInfo,
) => {
	switch (messageTemplateId) {
		case 'TEST':
			return buildTestEmail(newsletterId, emailEnvInfo);
		case 'NEW_DRAFT':
			return buildNewDraftEmail(newsletterId, emailEnvInfo);
	}
};

export const sendEmailNotifications = async (
	messageTemplateId: MessageTemplateId,
	newsletterId: string,
	emailClient: SESClient,
	emailEnvInfo: EmailEnvInfo,
): Promise<
	| { success: true; output: SendEmailCommandOutput }
	| { success: false; error?: unknown }
> => {
	try {
		const message = getMessage(messageTemplateId, newsletterId, emailEnvInfo);
		const command = buildSendEmailCommand(
			message.messageConfig,
			message.content,
		);
		const output = await emailClient.send(command);
		return { output, success: true };
	} catch (error) {
		console.warn(`send of ${messageTemplateId} email failed`, error as unknown);
		return { error: error as unknown, success: false };
	}
};
