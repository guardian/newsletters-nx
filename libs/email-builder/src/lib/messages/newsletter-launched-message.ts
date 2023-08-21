import type {
	EmailEnvInfo,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { getMessageConfig } from '../message-config';
import type { MessageContent, NewsletterLaunchedMessageParams } from '../types';

const makeHtml = (newsletter: NewsletterData, pageLink: string) => `
<div>
	<table>
		<tbody>
			<tr>
				<th>
					<h1>Newsletter Launched!</h1>
				</th>
				<td>GUARDIAN NEWSLETTERS</td>
			</tr>
			<tr>
				<td>
					A new newsletter <a href="${pageLink}">${newsletter.name}</a> has been launched.
				</td>
			</tr>
			<tr>
				<td>
					<em>This is an automated message from the newsletters tool</em>
				</td>
			</tr>
		<tbody>
	</table>
</div>
`;

export function buildNewsLetterLaunchMessage(
	params: NewsletterLaunchedMessageParams,
	emailEnvInfo: EmailEnvInfo,
) {
	const { identityName, name = '' } = params.newsletter;
	const messageConfig = getMessageConfig(
		['newsletters.dev@guardian.co.uk'],
		emailEnvInfo,
	);

	const pageLink = `${messageConfig.toolHost}/launched/${identityName}`;

	const content: MessageContent = {
		subject: `New newsletters launched: ${name}`,
		html: makeHtml(params.newsletter, pageLink),
		text: `A new newsletter "${name}" has been launched: ${pageLink}.`,
	};

	return { content, messageConfig };
}
