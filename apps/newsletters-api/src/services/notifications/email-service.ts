import { buildTestMessage, makeSesClient } from '@newsletters-nx/email-builder';

export const sendEmailNotifications = async (newsletterId: string) => {
	// create a client
	const emailClient = makeSesClient();
	// now send an email
	const testMessage = buildTestMessage(newsletterId);

	await emailClient.send(testMessage);
};
