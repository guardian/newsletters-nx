import { TECHSCAPE_IN_NEW_FORMAT } from '../../fixtures/newsletter-fixtures';
import sampleData from '../../fixtures/sample-data.json';
import { isNewsletterData } from './newsletter-data-type';
import { readMoreSectionSchema } from './rendering-options-data-type';

describe('isNewsletterData', () => {
	it('Does not filter out any valid newsletters', () => {
		const allNames = sampleData.map((newsletter) => newsletter.identityName);
		const filteredData = sampleData.filter(isNewsletterData);
		const filteredNames = filteredData.map(
			(newsletter) => newsletter.identityName,
		);

		const excludedNames = allNames.filter(
			(name) => !filteredNames.includes(name),
		);
		expect(excludedNames).toEqual([]);
		expect(filteredData.length).toBe(sampleData.length);
	});
	it('Does will filter out any invalid newsletters', () => {
		const invalidItems = [
			{ iAm: 'not a newsletter' },
			45,
			null,
			[43],
			'This is a string',
			{
				...TECHSCAPE_IN_NEW_FORMAT,
				identityName: 12,
				listId: 'this should be a number',
			},
		];
		const filteredData = invalidItems.filter(isNewsletterData);
		expect(filteredData.length).toBe(0);
	});
	it('Allows extra properties, provided they do not conflict with existing keys', () => {
		const newsletterWithExtraProperties = {
			...TECHSCAPE_IN_NEW_FORMAT,
			'this is not an expected key name so should be ignored': true,
			meaningOfLifeTheUniverseAndEveryThing: 42,
		};
		expect(isNewsletterData(newsletterWithExtraProperties)).toBe(true);
	});
});

describe('Read more destinations', () => {
	const item = { subheading: 'Read more', wording: 'More food news' };
	const fullUrl = 'https://www.theguardian.com/food';
	it('keeps only the onward path as the destination when parsing', () => {
		expect(
			readMoreSectionSchema.parse({
				...item,
				onwardPath: '/food',
				url: fullUrl,
			}),
		).toEqual({ ...item, onwardPath: '/food' });
	});
	it('does not accept a legacy URL in place of an onward path', () => {
		expect(
			readMoreSectionSchema.safeParse({ ...item, url: fullUrl }).success,
		).toBe(false);
	});
});
