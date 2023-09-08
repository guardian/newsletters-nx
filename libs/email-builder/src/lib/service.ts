import type { SendEmailCommandOutput, SESClient } from '@aws-sdk/client-ses';
import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { buildSendEmailCommand } from './build-send-email-command';
import {
	buildBrazeSetUpRequestMessage,
	buildNewDraftEmail,
	buildNewsLetterLaunchMessage,
	buildTagCreationRequestMessage,
} from './messages';
import { buildSignUpPageCreationRequestMessage } from './messages/request-sign-up-page-creation-message';
import type { MessageConfig, MessageContent, MessageParams } from './types';

const getMessage = async (
	params: MessageParams,
	emailEnvInfo: EmailEnvInfo,
): Promise<{
	content: MessageContent;
	messageConfig: MessageConfig;
}> => {
	switch (params.messageTemplateId) {
		case 'NEW_DRAFT':
			return buildNewDraftEmail(params, emailEnvInfo);
		case 'NEWSLETTER_LAUNCH':
			return buildNewsLetterLaunchMessage(params, emailEnvInfo);
		case 'BRAZE_SET_UP_REQUEST':
			return buildBrazeSetUpRequestMessage(params, emailEnvInfo);
		case 'TAG_CREATION_REQUEST':
			return buildTagCreationRequestMessage(params, emailEnvInfo);
		case 'SIGN_UP_PAGE_CREATION_REQUEST':
			return buildSignUpPageCreationRequestMessage(params, emailEnvInfo);
	}
};

export const sendEmailNotifications = async (
	params: MessageParams,
	emailClient: SESClient,
	emailEnvInfo: EmailEnvInfo,
): Promise<
	| { success: true; output?: SendEmailCommandOutput }
	| { success: false; error?: unknown }
> => {
	try {
		const { areEmailNotificationsEnabled } = emailEnvInfo;

		if (!areEmailNotificationsEnabled) {
			return {
				success: true,
			};
		}

		const message = await getMessage(params, emailEnvInfo);
		const command = buildSendEmailCommand(
			message.messageConfig,
			message.content,
		);
		const output = await emailClient.send(command);
		return { output, success: true };
	} catch (error) {
		console.warn(
			`send of ${params.messageTemplateId} email failed`,
			error as unknown,
		);
		return { error: error as unknown, success: false };
	}
};
