import { SendEmailCommand } from '@aws-sdk/client-ses';
import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';

const getRecipients = (emailEnvInfo: EmailEnvInfo): string[] => {
	const { STAGE, TEST_EMAIL_RECIPIENT } = emailEnvInfo;
	const devMailingList = TEST_EMAIL_RECIPIENT ? [TEST_EMAIL_RECIPIENT] : [];

	return STAGE === 'DEV' ? devMailingList : ['newsletters.dev@guardian.co.uk'];
	// Still testing - using newsletters.dev@guardian.co.uk as the 'live' recipient
	// could use config for this too
};

export function buildTestMessage(
	newsletterId: string,
	emailEnvInfo: EmailEnvInfo,
): SendEmailCommand {
	const { STAGE } = emailEnvInfo;

	const updateLink = `${
		STAGE === 'PROD'
			? 'https://newsletters-tool.gutools.co.uk'
			: 'https://newsletters-tool.code.dev-gutools.co.uk'
	}/launched/edit/${newsletterId}`;

	const recipients = getRecipients(emailEnvInfo);

	return new SendEmailCommand({
		Source:
			STAGE !== 'PROD'
				? 'newsletters <notifications@newsletters-tool.code.dev-gutools.co.uk>'
				: 'newsletters CODE <notifications@newsletters-tool.gutools.co.uk>',
		Destination: {
			ToAddresses: recipients,
		},
		ReplyToAddresses: ['newsletters@guardian.co.uk'], // again, just testing
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
	});
}
