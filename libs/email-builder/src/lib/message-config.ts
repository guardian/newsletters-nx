import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import type { MessageConfig } from './types';

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
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source:
					'newsletters DEV <notifications@newsletters-tool.gutools.co.uk>',
			};
		case 'PROD':
			return {
				recipients: prodRecipients,
				toolHost: 'https://newsletters-tool.gutools.co.uk',
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source:
					'newsletters <notifications@newsletters-tool.code.dev-gutools.co.uk>',
			};
		case 'CODE':
		default:
			return {
				recipients: testMailingList,
				toolHost: 'https://newsletters-tool.code.dev-gutools.co.uk',
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source:
					'newsletters CODE <notifications@newsletters-tool.gutools.co.uk>',
			};
	}
};
