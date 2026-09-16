import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { TECHSCAPE_IN_NEW_FORMAT } from '../../fixtures/newsletter-fixtures';
import { makeBlankMeta } from '../schemas/meta-data-type';
import type { NewsletterData } from '../schemas/newsletter-data-type';
import { objectToNewsletter } from './objectToNewsletter';

const makeGetObjectOutput = (body?: string): GetObjectCommandOutput =>
	({
		Body:
			body === undefined
				? undefined
				: { transformToString: () => Promise.resolve(body) },
	}) as GetObjectCommandOutput;

describe('objectToNewsletter', () => {
	test('returns undefined when getObjectOutput.Body is undefined', () => {
		void expect(objectToNewsletter(makeGetObjectOutput())).resolves.toEqual(
			undefined,
		);
	});

	test('returns undefined when invalid JSON body returned', () => {
		void expect(
			objectToNewsletter(makeGetObjectOutput('not json')),
		).resolves.toEqual(undefined);
	});

	test('returns undefined when json is not a newsletter', () => {
		void expect(
			objectToNewsletter(makeGetObjectOutput('{"foo": "bar"}')),
		).resolves.toEqual(undefined);
	});

	test('returns newsletter without key where no key is specified', async () => {
		// What's going on here? The fixture is a NewsletterData object (Containing Dates), what
		// We are storing is JSON, hence the Stringify and Parse.
		const newsletterAsStored = JSON.stringify(TECHSCAPE_IN_NEW_FORMAT);
		const expectedNewsletter = JSON.parse(newsletterAsStored) as NewsletterData;

		const actualNewsletter = await objectToNewsletter(
			makeGetObjectOutput(newsletterAsStored),
		);

		expect(actualNewsletter).toEqual({
			...expectedNewsletter,
			meta: makeBlankMeta(),
		});
	});

	test('keeps the meta data stored on the record', async () => {
		const storedMeta = {
			createdTimestamp: 1690000000000,
			updatedTimestamp: 1700000000000,
			createdBy: 'author@example.com',
			updatedBy: 'editor@example.com',
		};

		const actualNewsletter = await objectToNewsletter(
			makeGetObjectOutput(
				JSON.stringify({ ...TECHSCAPE_IN_NEW_FORMAT, meta: storedMeta }),
			),
		);

		expect(actualNewsletter?.meta).toEqual(storedMeta);
	});
});
