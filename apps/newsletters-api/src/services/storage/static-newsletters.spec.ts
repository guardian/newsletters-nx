import newslettersData from '../../../static/newsletters.local.json';

// In-memory storage finds newsletters by listId when saving, so a shared
// listId sends one newsletter's edits to the other.
describe('static newsletter data', () => {
	const findDuplicates = (values: unknown[]) =>
		values.filter((value, index) => values.indexOf(value) !== index);

	it('has a unique listId for every newsletter', () => {
		expect(
			findDuplicates(newslettersData.map((newsletter) => newsletter.listId)),
		).toEqual([]);
	});

	it('has a unique identityName for every newsletter', () => {
		expect(
			findDuplicates(
				newslettersData.map((newsletter) => newsletter.identityName),
			),
		).toEqual([]);
	});
});
