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

/**
 * Appends a delimiter symbol and a series of "i"'s to the original token
 * if it already included in the existingTokens. Multiple "i"'s are added
 * if `${original}${delimiter}i` is already an existingToken.
 *
 * This is not ideal - it ensures the suggested derived name is
 * unqiue, but the user should have the option to replace it with a
 * more readable name.
 */
export const addSuffixToMakeTokenUnique = (
	originalToken: string,
	existingTokens: Array<string | undefined>,
	delimiter = '-',
): string => {
	// no duplicates, so can use the token name

	console.log('dedupe', { originalToken, existingTokens });

	if (!existingTokens.includes(originalToken)) {
		return originalToken;
	}

	let suffixNumber = 1;
	let newIdentityName = '';

	while (newIdentityName === '') {
		const nextPossibleName = `${originalToken}${delimiter}${'i'.repeat(
			suffixNumber,
		)}`;
		if (!existingTokens.includes(nextPossibleName)) {
			newIdentityName = nextPossibleName;
		}
		suffixNumber++;
	}
	console.log('change', { newIdentityName });
	return newIdentityName;
};
