import { renderToStaticMarkup } from 'react-dom/server';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { MessageContent } from '../types';
import { MessageFormat } from './MessageFormat';
import { NewsletterPropertyTable } from './NewsletterPropertyTable';

interface Props {
	pageLink: string;
	newsletter: NewsletterData;
}

export const RequestBrazeSetUpMessage = ({ pageLink, newsletter }: Props) => {
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
				The Braze values for this newsletter are below - if these need to change for
				any reason, please <a href={pageLink}>update in the newsletters tool</a> .
			</p>

			<NewsletterPropertyTable
				newsletter={newsletter}
				properties={[
					'identityName',
					'brazeNewsletterName',
					'brazeSubscribeAttributeName',
					'brazeSubscribeAttributeNameAlternate',
					'brazeSubscribeEventNamePrefix',
				]}
			/>

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
	// TO DO - generate the tag version nicely
	const text = `A new newsletter "${newsletter.name}" has been launched: ${pageLink}. Please create the campaign.`;

	try {
		const html = renderToStaticMarkup(<RequestBrazeSetUpMessage {...props} />);
		return { html, text, subject };
	} catch (e) {
		console.error(e);
		return { html: text, text, subject };
	}
};
