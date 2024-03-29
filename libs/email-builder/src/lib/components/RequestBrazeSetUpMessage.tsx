import { renderToStaticMarkup } from 'react-dom/server';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import {
	brazeSubscribeEventName,
	brazeUnsubscribeEventName,
	emailRenderingLatestInSeriesUrl,
	temporarySignUpUrl,
} from '@newsletters-nx/newsletters-data-client';
import type { MessageContent } from '../types';
import { MessageFormat } from './MessageFormat';
import { NewsletterPropertyTable } from './NewsletterPropertyTable';

interface Props {
	pageLink: string;
	newsletter: NewsletterData;
}

export const RequestBrazeSetUpMessage = ({ pageLink: pageEditLink, newsletter }: Props) => {
	const pageDetailsLink = pageEditLink.split('/').filter(element => element !== 'edit').join('/');
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
				The Braze values for this newsletter are below - if these need to change
				for any reason, please{' '}
				<a href={pageEditLink}>update in the newsletters tool</a> .
			</p>

			<NewsletterPropertyTable
				newsletter={newsletter}
				properties={[
					'identityName',
					'brazeNewsletterName',
					'brazeSubscribeAttributeName',
					'brazeSubscribeAttributeNameAlternate',
					'brazeSubscribeEventNamePrefix',
					brazeSubscribeEventName,
					brazeUnsubscribeEventName,
					emailRenderingLatestInSeriesUrl,
					temporarySignUpUrl,
				]}
			/>

			<p>
				A Braze template has been created for this newsletter. The template code
				is available in the <a href={pageDetailsLink}>newsletters tool</a>.
			</p>

			<p>
				Note that the "temporary sign Up URL" will not be available immediately
				after a newsletter is launched as the site can take 1-3 hours to update
				its list of newsletters.
			</p>

			<p>
				When you have set up the campaign, please go to{' '}
				<a href={pageEditLink}>this page on the newsletters tool</a> to confirm!
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
