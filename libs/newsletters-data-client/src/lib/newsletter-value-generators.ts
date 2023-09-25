import type { NewsletterData } from '..';

export type NewsletterValueGenerator = {
	generate: { (newsletter: NewsletterData): string };
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
