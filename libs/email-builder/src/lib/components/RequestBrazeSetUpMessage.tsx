import { renderToStaticMarkup } from 'react-dom/server';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { MessageContent } from '../types';
import { MessageFormat } from './MessageFormat';

interface Props {
	pageLink: string;
	newsletter: NewsletterData;
}

export const BrazeSetupRequestMessage = ({ pageLink, newsletter }: Props) => {
	return (
		<MessageFormat
			title={
				<>
					Please create a new Braze campaign for newsletter "
					{newsletter.identityName}"
				</>
			}
		>
			<p>
				The Braze for this newsletter are below - if these need to change for
				any reason, please contact the newsletters team.
			</p>

			<table>
				<tbody>
					<tr>
						<th>brazeNewsletterName</th>
						<td>{newsletter.brazeNewsletterName}</td>
					</tr>
					<tr>
						<th>brazeSubscribeAttributeName</th>
						<td>{newsletter.brazeSubscribeAttributeName}</td>
					</tr>
					<tr>
						<th>brazeSubscribeAttributeNameAlternate</th>
						<td>{newsletter.brazeSubscribeAttributeNameAlternate?.join()}</td>
					</tr>
					<tr>
						<th>brazeSubscribeEventNamePrefix</th>
						<td>{newsletter.brazeSubscribeEventNamePrefix}</td>
					</tr>
				</tbody>
			</table>

			<p>
				When you have set up the campaign, please go to{' '}
				<a href={pageLink}>this page on the newsletters tool</a> to confirm!
			</p>
		</MessageFormat>
	);
};

export const renderBrazeSetupRequestMessage = (
	props: Props,
): MessageContent => {
	const { pageLink, newsletter } = props;
	const subject = `Braze campaign for newsletter "${newsletter.identityName}"`;
	const text = `A new newsletter "${newsletter.name}" has been launched: ${pageLink}. Please create the campaign.`;

	try {
		const html = renderToStaticMarkup(<BrazeSetupRequestMessage {...props} />);
		return { html, text, subject };
	} catch (e) {
		console.error(e);
		return { html: text, text, subject };
	}
};
