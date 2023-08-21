import { SendEmailCommand } from '@aws-sdk/client-ses';
import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';

type MessageConfig = {
	/** the emails addresses to send the message to */
	recipients: string[];
	/** the URL for the version of the tool to point recipients to */
	toolHost: string;
	/** the sender name  and email address to use in the message header*/
	source: string;
};

const getMessageConfig = (
	prodRecipients: string[],
	emailEnvInfo: EmailEnvInfo,
): MessageConfig => {
	const { STAGE, TEST_EMAIL_RECIPIENT } = emailEnvInfo;
	// TO DO - should the recipients for CODE be done differently?
	const testMailingList = TEST_EMAIL_RECIPIENT ? [TEST_EMAIL_RECIPIENT] : [];

	switch (STAGE) {
		case 'DEV':
			return {
				recipients: testMailingList,
				toolHost: 'http://localhost:4200',
				source:
					'newsletters DEV <notifications@newsletters-tool.gutools.co.uk>',
			};
		case 'PROD':
			return {
				recipients: prodRecipients,
				toolHost: 'https://newsletters-tool.gutools.co.uk',
				source:
					'newsletters <notifications@newsletters-tool.code.dev-gutools.co.uk>',
			};
		case 'CODE':
		default:
			return {
				recipients: testMailingList,
				toolHost: 'https://newsletters-tool.code.dev-gutools.co.uk',
				source:
					'newsletters CODE <notifications@newsletters-tool.gutools.co.uk>',
			};
	}
};

export function buildTestMessage(
	newsletterId: string,
	emailEnvInfo: EmailEnvInfo,
): SendEmailCommand {
	const { recipients, source, toolHost } = getMessageConfig(
		['newsletters.dev@guardian.co.uk'],
		emailEnvInfo,
	);

	const updateLink = `${toolHost}/launched/edit/${newsletterId}`;

	return new SendEmailCommand({
		Source: source,
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
