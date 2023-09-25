import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { getConfigValue } from '@newsletters-nx/util';
import type { EmailRecipientConfiguration, MessageConfig } from './types';

/** 15 minutes*/
const TIME_BETWEEN_RECIPIENT_PARAM_CHECKS = 1000 * 60 * 15;

export type NewsletterMessageId =
	| 'NEW_DRAFT_CREATED'
	| 'NEWSLETTER_LAUNCH'
	| 'SIGN_UP_PAGE_CREATION_REQUEST'
	| 'TAG_CREATION_REQUEST'
	| 'BRAZE_SET_UP_REQUEST'
	| 'CENTRAL_PRODUCTION_TAGS_AND_SIGNUP_PAGE_REQUEST';

export const getMessageConfig = async (
	emailEnvInfo: EmailEnvInfo,
	messageType: NewsletterMessageId,
): Promise<MessageConfig> => {
	const { STAGE } = emailEnvInfo;

	const {
		draftCreatedRecipients,
		tagRecipients,
		signUpPageRecipients,
		brazeRecipients,
		launchRecipients,
		centralProductionRecipients,
	} = JSON.parse(
		await getConfigValue('emailRecipientConfiguration', {
			maxAge: TIME_BETWEEN_RECIPIENT_PARAM_CHECKS,
		}),
	) as EmailRecipientConfiguration;

	const recipientMapping: Record<NewsletterMessageId, string[]> = {
		NEW_DRAFT_CREATED: draftCreatedRecipients,
		NEWSLETTER_LAUNCH: launchRecipients,
		SIGN_UP_PAGE_CREATION_REQUEST: signUpPageRecipients,
		TAG_CREATION_REQUEST: tagRecipients,
		BRAZE_SET_UP_REQUEST: brazeRecipients,
		CENTRAL_PRODUCTION_TAGS_AND_SIGNUP_PAGE_REQUEST:
			centralProductionRecipients,
	};
	switch (STAGE) {
		case 'PROD':
			return {
				recipients: recipientMapping[messageType],
				toolHost: 'https://newsletters-tool.gutools.co.uk',
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source: 'newsletters <notifications@newsletters-tool-gutools.co.uk>',
			};
		case 'CODE':
			return {
				recipients: recipientMapping[messageType],
				toolHost: 'https://newsletters-tool.code.dev-gutools.co.uk',
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source:
					'newsletters CODE <notifications@newsletters-tool.code.dev-gutools.co.uk>',
			};
		case 'DEV':
		default:
			return {
				recipients: recipientMapping[messageType],
				toolHost: 'http://localhost:4200',
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source:
					'newsletters DEV <notifications@newsletters-tool.code.dev-gutools.co.uk>',
			};
	}
};
