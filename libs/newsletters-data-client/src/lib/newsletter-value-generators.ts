import type { NewsletterData } from '..';

export type NewsletterValueGenerator = {
	generate: { (newsletter: NewsletterData): string };
	description: string;
};

export const embedIframeCode: NewsletterValueGenerator = {
	generate: ({ identityName }: NewsletterData) =>
		`<iframe id="${identityName}" name="${identityName}" src="https://www.theguardian.com/email/form/plaintone/${identityName}" scrolling="no" seamless="" class="iframed--overflow-hidden email-sub__iframe" height="52px" frameborder="0" data-component="email-embed--${identityName}"></iframe>`,
	description:
		'The HTML code to paste into a composer embed block to add a sign-up form to the article content.',
};

// see https://github.com/guardian/identity/blob/main/identity-api/src/main/scala/com/gu/identity/api/mail/CmtModels.scala
export const brazeSubscribeEventName: NewsletterValueGenerator = {
	generate: ({ brazeSubscribeEventNamePrefix }: NewsletterData) =>
		`${brazeSubscribeEventNamePrefix}_subscribe_email_date`,
	description:
		'The name of the custom event the identity database adds to a Braze user record when a user subscribes to the newsletter',
};

export const brazeUnsubscribeEventName: NewsletterValueGenerator = {
	generate: ({ brazeSubscribeEventNamePrefix }: NewsletterData) =>
		`${brazeSubscribeEventNamePrefix}_unsubscribe_email_date`,
	description:
		'The name of the custom event the identity database adds to a Braze user record when a user unsubscribes to the newsletter',
};
