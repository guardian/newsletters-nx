import { TECHSCAPE_IN_NEW_FORMAT } from '../../fixtures/newsletter-fixtures';
import sampleData from '../../fixtures/sample-data.json';
import { isNewsletterData } from './newsletter-data-type';

describe('isNewsletterData', () => {
	it('Does not filter out any valid newsletters', () => {
		const filteredData = sampleData.filter(isNewsletterData);
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
});
