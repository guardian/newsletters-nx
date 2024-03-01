import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { getConfigValue } from '@newsletters-nx/util';
import type { EmailRecipientConfiguration, MessageConfig } from './types';

/** 15 minutes*/
const TIME_BETWEEN_RECIPIENT_PARAM_CHECKS = 1000 * 60 * 15;
const CODE_TOOLS_DOMAIN = 'newsletters-tool.code.dev-gutools.co.uk';
const PROD_TOOLS_DOMAIN = 'newsletters-tool.gutools.co.uk';

export type NewsletterMessageId =
	| 'NEW_DRAFT_CREATED'
	| 'NEWSLETTER_LAUNCH'
	| 'BRAZE_SET_UP_REQUEST'
	| 'BRAZE_UPDATE_REQUEST'
	| 'CENTRAL_PRODUCTION_TAGS_AND_SIGNUP_PAGE_REQUEST';

export const getMessageConfig = async (
	emailEnvInfo: EmailEnvInfo,
	messageType: NewsletterMessageId,
	ccRecipients?: string[],
): Promise<MessageConfig> => {
	const { STAGE } = emailEnvInfo;

	const {
		draftCreatedRecipients,
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
		BRAZE_SET_UP_REQUEST: brazeRecipients,
		BRAZE_UPDATE_REQUEST: brazeRecipients,
		CENTRAL_PRODUCTION_TAGS_AND_SIGNUP_PAGE_REQUEST:
			centralProductionRecipients,
	};
	switch (STAGE) {
		case 'PROD':
			return {
				recipients: recipientMapping[messageType],
				ccRecipients,
				toolHost: `https://${PROD_TOOLS_DOMAIN}`,
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source: `newsletters <notifications@${PROD_TOOLS_DOMAIN}>`,
			};
		case 'CODE':
			return {
				recipients: recipientMapping[messageType],
				ccRecipients,
				toolHost: `https://${CODE_TOOLS_DOMAIN}`,
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source: `newsletters CODE <notifications@${CODE_TOOLS_DOMAIN}>`,
			};
		case 'DEV':
		default:
			return {
				recipients: recipientMapping[messageType],
				ccRecipients,
				toolHost: 'http://localhost:4200',
				replyToAddresses: ['newsletters@guardian.co.uk'],
				source: `newsletters DEV <notifications@${CODE_TOOLS_DOMAIN}>`,
			};
	}
};
