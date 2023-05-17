import type { NewsletterData } from './newsletter-data-type';

export type NewsletterFieldsDerivedFromName =
	| 'identityName'
	| 'brazeSubscribeEventNamePrefix'
	| 'brazeNewsletterName'
	| 'brazeSubscribeAttributeName'
	| 'brazeSubscribeAttributeNameAlternate'
	| 'campaignName'
	| 'campaignCode';

const allWhiteSpaceRegEx = new RegExp(/\W/, 'g');
const replaceWhiteSpace = (input: string, replaceValue = '') =>
	input.replace(allWhiteSpaceRegEx, replaceValue);

export const deriveNewsletterFieldsFromName = (
	name: string,
): Pick<NewsletterData, NewsletterFieldsDerivedFromName> => {
	const lowerCased = name.toLowerCase();
	const trimmedLowerCase = lowerCased.trim();

	return {
		identityName: replaceWhiteSpace(trimmedLowerCase, '-'),
		brazeSubscribeEventNamePrefix: replaceWhiteSpace(trimmedLowerCase, '_'),
		brazeNewsletterName: 'Editorial_' + replaceWhiteSpace(name.trim()),
		brazeSubscribeAttributeName: replaceWhiteSpace(name) + '_Subscribe_Email',
		brazeSubscribeAttributeNameAlternate: [
			'email_subscribe_' + replaceWhiteSpace(trimmedLowerCase, '_'),
		],
		campaignName: replaceWhiteSpace(name),
		campaignCode: replaceWhiteSpace(trimmedLowerCase) + '_email',
	};
};
