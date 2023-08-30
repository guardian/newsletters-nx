import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import type { MessageConfig } from './types';

export const getMessageConfig = (
	prodRecipients: string[],
	emailEnvInfo: EmailEnvInfo,
): MessageConfig => {
	const { STAGE, testRecipients } = emailEnvInfo;
	// TO DO - should the recipients for CODE and DEV be different?

	switch (STAGE) {
		case 'PROD':
			return {
				recipients: prodRecipients,
				toolHost: 'https://newsletters-tool.gutools.co.uk',
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source: 'newsletters <notifications@newsletters-tool-gutools.co.uk>',
			};
		case 'CODE':
			return {
				recipients: testRecipients,
				toolHost: 'https://newsletters-tool.code.dev-gutools.co.uk',
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source:
					'newsletters CODE <notifications@newsletters-tool.code.dev.gutools.co.uk>',
			};
		case 'DEV':
		default:
			return {
				recipients: testRecipients,
				toolHost: 'http://localhost:4200',
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source:
					'newsletters DEV <notifications@newsletters-tool.code.dev-gutools.co.uk>',
			};
	}
};
