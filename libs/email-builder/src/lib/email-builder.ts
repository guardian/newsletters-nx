import { SendEmailCommand } from '@aws-sdk/client-ses';
import type { EmailEnvInfo } from '@newsletters-nx/newsletters-data-client';
import { getMessageConfig } from './message-config';

export function buildTestEmail(
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

export function buildNewDraftEmail(
	newsletterId: string,
	emailEnvInfo: EmailEnvInfo,
): SendEmailCommand {
	const { recipients, source, toolHost } = getMessageConfig(
		['newsletters.dev@guardian.co.uk'],
		emailEnvInfo,
	);

	const infolink = `${toolHost}/drafts/${newsletterId}`;

	return new SendEmailCommand({
		Source: source,
		Destination: {
			ToAddresses: recipients,
		},
		ReplyToAddresses: ['newsletters@guardian.co.uk'], // again, just testing
		Message: {
			Subject: {
				Data: `New draft email created`,
			},
			Body: {
				Text: {
					Data: `A new draft was created. You can see it on this page: ${infolink}.`,
				},
				Html: {
					Data: `<h1>A new draft was created. You can see it on <a href="${infolink}">this page</a>.</h1>`,
				},
			},
		},
	});
}
