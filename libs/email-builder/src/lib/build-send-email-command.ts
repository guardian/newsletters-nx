import { SendEmailCommand } from '@aws-sdk/client-ses';
import type { MessageConfig, MessageContent } from './types';

export const buildSendEmailCommand = (
	config: MessageConfig,
	content: MessageContent,
): SendEmailCommand => {
	const { source, recipients, replyToAddresses, ccRecipients = [] } = config;
	const { subject, html, text } = content;

	return new SendEmailCommand({
		Source: source,
		Destination: {
			ToAddresses: recipients,
			CcAddresses: ccRecipients,
		},
		ReplyToAddresses: replyToAddresses,
		Message: {
			Subject: {
				Data: subject,
			},
			Body: {
				Text: { Data: text },
				Html: {
					Data: html,
				},
			},
		},
	});
};
