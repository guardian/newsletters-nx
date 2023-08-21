import type { SendEmailCommandOutput, SESClient } from '@aws-sdk/client-ses';
import { buildTestMessage } from './email-builder';

export const sendEmailNotifications = async (
	newsletterId: string,
	emailClient: SESClient,
): Promise<SendEmailCommandOutput> => {
	const testMessage = buildTestMessage(newsletterId);

	return emailClient.send(testMessage);
};
