import type { SendEmailCommandOutput } from '@aws-sdk/client-ses';
import { buildTestMessage } from './email-builder';
import { makeSesClient } from './make-client';

export const sendEmailNotifications = async (
	newsletterId: string,
): Promise<SendEmailCommandOutput> => {
	// create a client
	const emailClient = makeSesClient();
	// now send an email
	const testMessage = buildTestMessage(newsletterId);

	return emailClient.send(testMessage);
};
