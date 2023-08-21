import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';

type MessageConfig = {
	/** the emails addresses to send the message to */
	recipients: string[];
	/** the URL for the version of the tool to point recipients to */
	toolHost: string;
	/** the sender name  and email address to use in the message header*/
	source: string;
};

export const getMessageConfig = (
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
