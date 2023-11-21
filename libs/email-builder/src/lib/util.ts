import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';

/**
 * If the newsletter's signUpPageDate is in the future, relative
 * to the sendTime (defaults to now), return a string describing that
 * date, otherwise return undefined
 */
export const getEmbargoDate = (
	newsletter: NewsletterData,
	sendTime = Date.now(),
) =>
	newsletter.signUpPageDate.valueOf() > sendTime
		? newsletter.signUpPageDate.toLocaleDateString(undefined, {
				dateStyle: 'long',
		  })
		: undefined;
