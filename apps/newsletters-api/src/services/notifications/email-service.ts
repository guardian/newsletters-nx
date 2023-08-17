import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { getStandardAwsConfig } from '../aws/aws-config-service';

export const sendEmailNotifications = async (newsletterId: string) => {
	const emailClient = new SESClient(getStandardAwsConfig());
	// now send an email
	const { STAGE } = process.env;
	const updateLink = `${
		STAGE === 'PROD'
			? 'https://newsletters-tool.gutools.co.uk'
			: 'https://newsletters-tool.code.dev-gutools.co.uk'
	}/launched/edit/${newsletterId}`;
	await emailClient.send(
		new SendEmailCommand({
			Source:
				STAGE !== 'PROD'
					? 'newsletters <notifications@newsletters-tool.code.dev-gutools.co.uk>'
					: 'newsletters CODE <notifications@newsletters-tool.gutools.co.uk>',
			Destination: {
				ToAddresses: ['newsletters.dev@guardian.co.uk'], // Just testing - we can move all this out to config later
			},
			ReplyToAddresses: ['newsletters@guardian.co.uk'],  // again, just testing
			Message: {
				Subject: {
					Data: `TEST - Please Ignore: Newsletter ${newsletterId} requires some action`,
				},
				Body: {
					Text: { Data: 'Some Test Email' },
					Html: {
						Data: `<h1>Do something usefult to <a href="${updateLink}">this newsletter</a></h1>`,
					},
				},
			},
		}),
	);
};
