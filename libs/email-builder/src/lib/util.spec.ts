import { ART_WEEKLY_FIXTURE } from '../fixtures/sample-newsletters';
import { getEmbargoDate } from './util';

const FAR_PAST = new Date('1024-01-01');
const FAR_FUTURE = new Date('4024-01-01');

describe('getEmbargoDate', () => {
	it('Should return undefined if the signUpPageDate is in the past', () => {
		const result = getEmbargoDate({
			...ART_WEEKLY_FIXTURE,
			signUpPageDate: FAR_PAST,
		});
		expect(result).toBeUndefined();
	});
	it('Should return a string with the date if the signUpPageDate is in the future', () => {
		const result = getEmbargoDate({
			...ART_WEEKLY_FIXTURE,
			signUpPageDate: FAR_FUTURE,
		});

		expect(result).toBeDefined();
		expect(result?.includes('4024')).toBeTruthy();
	});
	it('Works for small differences', () => {
		const yesterday = new Date('2020-01-14');
		const now = new Date('2020-01-15');
		const tomorrow = new Date('2020-01-16');

		const resultWhenSignUpDateIsYesterday = getEmbargoDate(
			{
				...ART_WEEKLY_FIXTURE,
				signUpPageDate: yesterday,
			},
			now.valueOf(),
		);
		const resultWhenSignUpDateIsTomorrow = getEmbargoDate(
			{
				...ART_WEEKLY_FIXTURE,
				signUpPageDate: tomorrow,
			},
			now.valueOf(),
		);

		expect(resultWhenSignUpDateIsYesterday).toBeUndefined();
		expect(resultWhenSignUpDateIsTomorrow).toBeDefined();
	});
});
