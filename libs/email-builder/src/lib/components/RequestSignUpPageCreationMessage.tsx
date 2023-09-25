import { renderToStaticMarkup } from 'react-dom/server';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { MessageContent } from '../types';
import { MessageFormat } from './MessageFormat';
import { NewsletterPropertyTable } from './NewsletterPropertyTable';

interface Props {
	pageLink: string;
	newsletter: NewsletterData;
}

export const RequestSignUpPageCreationMessage = ({
	pageLink,
	newsletter,
}: Props) => {
	const embargoDate =
		newsletter.signUpPageDate.valueOf() > Date.now()
			? newsletter.signUpPageDate.toLocaleDateString(undefined, {
					dateStyle: 'long',
			  })
			: undefined;

	return (
		<MessageFormat
			title={
				<>
					Please create a Sign up Page Article in Composer for newsletter"
					{newsletter.identityName}"
				</>
			}
		>
			Could you please create a sign-up page article for the following new
			newsletter:
			<NewsletterPropertyTable
				newsletter={newsletter}
				properties={['name', 'signUpHeadline', 'signUpDescription']}
			/>
			{embargoDate && (
				<p>
					Please add an embargo so that the sign up page should not go live
					until {embargoDate}.
				</p>
			)}
			{!embargoDate && <p>The page can go live immediately.</p>}
			<p>
				When the article is created, please go to{' '}
				<a href={pageLink}>this page on the newsletters tool</a> to confirm
			</p>
		</MessageFormat>
	);
};

export const renderRequestTagCreationMessage = (
	props: Props,
): MessageContent => {
	const { pageLink, newsletter } = props;
	const subject = `Sign up page for newsletter "${newsletter.identityName}"`;
	// TO DO - generate the text version nicely
	const text = `A new newsletter "${newsletter.name}" has been launched: ${pageLink}. Please create the Sign-up page.`;

	try {
		const html = renderToStaticMarkup(
			<RequestSignUpPageCreationMessage {...props} />,
		);
		return { html, text, subject };
	} catch (e) {
		console.error(e);
		return { html: text, text, subject };
	}
};
