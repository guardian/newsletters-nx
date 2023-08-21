import type { SendEmailCommandOutput, SESClient } from '@aws-sdk/client-ses';
import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { buildTestMessage } from './email-builder';

export const sendEmailNotifications = async (
	newsletterId: string,
	emailClient: SESClient,
	emailEnvInfo: EmailEnvInfo,
): Promise<SendEmailCommandOutput> => {
	const testMessage = buildTestMessage(newsletterId, emailEnvInfo);

	return emailClient.send(testMessage);
};
