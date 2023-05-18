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
 * Appends a "-i" to the end of the originalIdentityName if it
 * is already included in the existingIdentityNames. If
 * {originalIdentityName}-i is already in existingIdentityNames,
 * continues to append additional "i"'s until the name is unique.
 *
 * This is not ideal - it ensures the suggested derived name is
 * unqiue, but the user should have the option to replace it with a
 * more readable name.
 */
export const addSuffixToIdentityName = (
	originalIdentityName: string,
	existingIdentityNames: string[],
): string => {
	// no duplicates, so can use the original name
	if (!existingIdentityNames.includes(originalIdentityName)) {
		return originalIdentityName;
	}

	let suffixNumber = 1;
	let newIdentityName = '';

	while (newIdentityName === '') {
		const nextPossibleName = `${originalIdentityName}-${'i'.repeat(
			suffixNumber,
		)}`;
		if (!existingIdentityNames.includes(nextPossibleName)) {
			newIdentityName = nextPossibleName;
		}
		suffixNumber++;
	}
	return newIdentityName;
};
