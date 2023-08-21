import type { SendEmailCommandOutput, SESClient } from '@aws-sdk/client-ses';
import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { buildNewDraftEmail, buildTestEmail } from './email-builder';

type MessageTemplateId = 'TEST' | 'NEW_DRAFT';

export const sendEmailNotifications = async (
	messageTemplateId: MessageTemplateId,
	newsletterId: string,
	emailClient: SESClient,
	emailEnvInfo: EmailEnvInfo,
): Promise<SendEmailCommandOutput> => {
	switch (messageTemplateId) {
		case 'TEST':
			return emailClient.send(buildTestEmail(newsletterId, emailEnvInfo));
		case 'NEW_DRAFT':
			return emailClient.send(buildNewDraftEmail(newsletterId, emailEnvInfo));
	}
};
