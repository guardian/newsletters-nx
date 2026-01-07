import type { NewsletterData } from '..';
import { generateBrazeTemplateString } from './generate-braze-template';

export type NewsletterValueGenerator = {
	generate: { (newsletter: NewsletterData, override?: string): string };
	displayName: string;
	description: string;
};

export const embedIframeCode: NewsletterValueGenerator = {
	generate: ({ identityName }: NewsletterData) =>
		`<iframe id="${identityName}" name="${identityName}" src="https://www.theguardian.com/email/form/plaintone/${identityName}" scrolling="no" seamless="" class="iframed--overflow-hidden email-sub__iframe" height="52px" frameborder="0" data-component="email-embed--${identityName}"></iframe>`,
	displayName: 'Sign up embed code',
	description:
		'The HTML code to paste into a composer embed block to add a sign-up form to the article content.',
};

export const brazeTemplateCode: NewsletterValueGenerator = {
	generate: (newsletter: NewsletterData, override?: string) =>
		generateBrazeTemplateString(newsletter, override),
	displayName: 'Braze campaign template code',
	description: 'The template code to use in the Braze campaign.',
};

// see https://github.com/guardian/identity/blob/main/identity-api/src/main/scala/com/gu/identity/api/mail/CmtModels.scala
export const brazeSubscribeEventName: NewsletterValueGenerator = {
	generate: ({ brazeSubscribeEventNamePrefix }: NewsletterData) =>
		`${brazeSubscribeEventNamePrefix}_subscribe_email_date`,
	displayName: 'braze subscribe event name',
	description:
		'The name of the custom event the identity database adds to a Braze user record when a user subscribes to the newsletter',
};

export const brazeUnsubscribeEventName: NewsletterValueGenerator = {
	generate: ({ brazeSubscribeEventNamePrefix }: NewsletterData) =>
		`${brazeSubscribeEventNamePrefix}_unsubscribe_email_date`,
	displayName: 'braze unsubscribe event name',
	description:
		'The name of the custom event the identity database adds to a Braze user record when a user unsubscribes to the newsletter',
};

export const temporarySignUpUrl: NewsletterValueGenerator = {
	generate: ({ identityName }: NewsletterData) =>
		`https://www.theguardian.com/email/form/plain/${identityName}`,
	displayName: 'temporary sign Up URL',
	description:
		'A link to a page on the theguardian.com that renders a basic sign-up form for the newsletter. Note this page will not be available immediately after a newsletter is launched as the site can take 1-3 hours to update its list of newsletters',
};

// see https://github.com/guardian/email-rendering/blob/main/src/articleApp/index.ts
export const emailRenderingLatestInSeriesUrl: NewsletterValueGenerator = {
	generate: ({ seriesTag }: NewsletterData) =>
		seriesTag
			? `https://email-rendering.guardianapis.com/article/${seriesTag}/latest.json`
			: `[not available - no series tag defined]`,
	displayName: 'email-rendering latest in series URL',
	description:
		"The URL to render the latest article in the Newsletter's series tag as JSON for consumption by Braze.",
};

export const emailEndpoint: NewsletterValueGenerator = {
	generate: ({ seriesTag }: NewsletterData) =>
		seriesTag
			? `${seriesTag}/latest.json`
			: `[not available - no series tag defined]`,
	displayName: 'email_endpoint',
	description: 'The value to use for email_endpoint in the Braze campaign',
};

export const emailContent: NewsletterValueGenerator = {
	generate: () => 'Editorial_FirstEditionContent',
	displayName: 'email_content',
	description: 'The value to use for email_content in the Braze campaign',
};

// see https://github.com/guardian/frontend/blob/d67c1c03875bfb972de000305a922dade6c8285d/common/app/services/NewsletterService.scala#L31
export const composerCampaignTagId: NewsletterValueGenerator = {
	generate: ({ identityName }) => `campaign/email/${identityName}`,
	displayName: 'Composer Campaign Tag Id(path)',
	description:
		'The id (AKA "path") to use when creating the Composer Campaign Tag. The Composer Campaign Tag path MUST be this to cause signup forms to appear in articles and sign-up pages.',
};
