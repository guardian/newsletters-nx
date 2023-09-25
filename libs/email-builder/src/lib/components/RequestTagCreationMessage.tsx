import { renderToStaticMarkup } from 'react-dom/server';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { MessageContent } from '../types';
import { MessageFormat } from './MessageFormat';

interface Props {
	pageLink: string;
	newsletter: NewsletterData;
}

export const RequestTagCreationMessage = ({ pageLink, newsletter }: Props) => {
	// message is only sent if there is a defined series tag, but composerCampaignTag could be undefined.
	const {
		seriesTag,
		seriesTagDescription,
		composerCampaignTag,
		composerTag: tagsThatPromptRecommendationOfCampaignTag,
	} = newsletter;
	const title = composerCampaignTag
		? `Please create a Series and Campaign Tags for newsletter " ${newsletter.identityName}"`
		: `Please create a Series Tag for newsletter " ${newsletter.identityName}"`;

	return (
		<MessageFormat title={title}>
			<p>
				Can you please create the below tags in order to support the launch of
				the "{newsletter.name}"" newsletter?
			</p>

			<ul>
				<li>
					<b>Series Tag:</b> {seriesTag}
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

			<p>
				When you have set up the tags, please go to{' '}
				<a href={pageLink}>this page on the newsletters tool</a> to confirm
			</p>
		</MessageFormat>
	);
};

export const renderRequestTagCreationMessage = (
	props: Props,
): MessageContent => {
	const { pageLink, newsletter } = props;
	const subject = `Series Tags for newsletter "${newsletter.identityName}"`;
	// TO DO - generate the text version nicely
	const text = `A new newsletter "${newsletter.name}" has been launched: ${pageLink}. Please create the Tags.`;

	try {
		const html = renderToStaticMarkup(<RequestTagCreationMessage {...props} />);
		return { html, text, subject };
	} catch (e) {
		console.error(e);
		return { html: text, text, subject };
	}
};
