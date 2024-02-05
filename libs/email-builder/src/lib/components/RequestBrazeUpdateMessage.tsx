import { renderToStaticMarkup } from 'react-dom/server';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import {
	emailContent,
	emailEndpoint,
} from '@newsletters-nx/newsletters-data-client';
import type { MessageContent } from '../types';
import { MessageFormat } from './MessageFormat';
import { NewsletterPropertyTable } from './NewsletterPropertyTable';

interface Props {
	pageLink: string;
	newsletter: NewsletterData;
}

export const RequestBrazeUpdateMessage = ({ pageLink, newsletter }: Props) => {
	if (!newsletter.seriesTag) {
		throw new Error(
			`Newsletter "${newsletter.identityName}" does not have a seriesTag`,
		);
	}
	return (
		<MessageFormat
			title={
				<>
					Please update the Braze campaign for newsletter "
					{newsletter.identityName}"
				</>
			}
		>
			<p>
				Please update the <strong>{newsletter.brazeNewsletterName}</strong>{' '}
				Braze campaign with the following values:
			</p>
			<NewsletterPropertyTable
				newsletter={newsletter}
				properties={[emailContent, emailEndpoint]}
			/>
			<p>
				<strong>
					Ensure that the plaintext editor version in Braze is checked and
					updated too.
				</strong>
			</p>
			<p>
				Once the Campaign has been updated, please visit{' '}
				<a href={pageLink}>this page on the newsletters tool</a> to confirm!
			</p>
		</MessageFormat>
	);
};

export const renderBrazeUpdateRequestMessage = (
	props: Props,
): MessageContent => {
	const { pageLink, newsletter } = props;
	const subject = `Update Braze campaign for newsletter "${newsletter.identityName}"`;

	const text = `"${newsletter.name}" has been updated: ${pageLink}. Please update the Braze campaign.`;

	try {
		const html = renderToStaticMarkup(<RequestBrazeUpdateMessage {...props} />);
		return { html, text, subject };
	} catch (e) {
		console.error(e);
		return { html: text, text, subject };
	}
};
