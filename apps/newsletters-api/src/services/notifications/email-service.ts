import { SESClient } from '@aws-sdk/client-ses';
import { testMessageBuilder } from '@newsletters-nx/email-builder';
import { getStandardAwsConfig } from '../aws/aws-config-service';

export const sendEmailNotifications = async (newsletterId: string) => {
	const emailClient = new SESClient(getStandardAwsConfig());
	// now send an email
	const testMessage = testMessageBuilder(newsletterId);

	await emailClient.send(testMessage);
};
