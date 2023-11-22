import { renderToStaticMarkup } from 'react-dom/server';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { MessageContent } from '../types';
import { getEmbargoDate } from '../util';
import { MessageFormat } from './MessageFormat';
import { NewsletterPropertyTable } from './NewsletterPropertyTable';

interface Props {
	pageLink: string;
	newsletter: NewsletterData;
}

export const RequestTagAndSignUpPageMessage = ({
	pageLink,
	newsletter,
}: Props) => {
	const {
		seriesTag,
		seriesTagDescription,
		theme,
		composerCampaignTag,
		composerTag: tagsThatPromptRecommendationOfCampaignTag,
	} = newsletter;
	const viewDetailsLink = pageLink
		.split('/')
		.filter((element) => element !== 'edit')
		.join('/');
	const embargoDate = getEmbargoDate(newsletter);
	const tagTitle = composerCampaignTag
		? ` series and campaign tags`
		: ` a series tag`;

	const title = `Please create a sign-up page article in Composer & ${tagTitle} for newsletter`;
	return (
		<MessageFormat title={title}>
			<p>
				Can you please create complete the following tasks to support the launch
				of the "{newsletter.name}"" newsletter?
			</p>
			<h2> Create Tags </h2>
			<ul>
				<li>
					<b>Series Tag:</b> {seriesTag} (Section: {theme})
				</li>
				{seriesTagDescription && (
					<li>
						<b>Series Tag Description:</b> {seriesTagDescription}
					</li>
				)}
				{composerCampaignTag && (
					<li>
						<b>Campaign Tag:</b> {composerCampaignTag}
					</li>
				)}
			</ul>

			{!!(composerCampaignTag && tagsThatPromptRecommendationOfCampaignTag) && (
				<div>
					<p>
						Can the tag relationship be set up so that{' '}
						<b>{newsletter.composerCampaignTag}</b> will be suggested when the
						following tags are used:
					</p>
					<p>{tagsThatPromptRecommendationOfCampaignTag}</p>
				</div>
			)}

			<h2> Create sign-up page </h2>
			<NewsletterPropertyTable
				newsletter={newsletter}
				properties={['name', 'signUpHeadline', 'signUpDescription']}
			/>
			<p>
				The embed code for the sign-up page is available in the{' '}
				<a href={viewDetailsLink}>newsletters tool</a>.
			</p>
			{embargoDate && (
				<p>
					Please add an embargo so that the sign up page should not go live
					until {embargoDate}.
				</p>
			)}
			{!embargoDate && (
				<p>
					When the page has been created, please contact{' '}
					<a href="mailto:newsletters@guardian.co.uk">
						newsletters@guardian.co.uk
					</a>{' '}
					to confirm when the page should be made live.
				</p>
			)}
			<p>
				When the tasks are completed, please go to{' '}
				<a href={pageLink}>this page on the newsletters tool</a> to confirm
			</p>
		</MessageFormat>
	);
};

export const renderRequestTagAndSignUpPageCreationMessage = (
	props: Props,
): MessageContent => {
	const { pageLink, newsletter } = props;
	const subject = `Action Required - Tags & Sign-up page for newsletter "${newsletter.identityName}"`;
	const text = `A new newsletter "${newsletter.name}" has been launched: ${pageLink}. Please create the Tags.`;
	try {
		const html = renderToStaticMarkup(
			<RequestTagAndSignUpPageMessage {...props} />,
		);
		return { html, text, subject };
	} catch (e) {
		console.error(e);
		return { html: text, text, subject };
	}
};
