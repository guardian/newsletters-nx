import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { TECHSCAPE_IN_NEW_FORMAT } from '../../fixtures/newsletter-fixtures';
import { makeBlankMeta } from '../schemas/meta-data-type';
import type { NewsletterData } from '../schemas/newsletter-data-type';
import { objectToNewsletter } from './objectToNewsletter';

describe('objectToNewsletter', () => {
	test('returns undefined when getObjectOutput.Body is undefined', () => {
		const getObjectOutput = {
			Body: undefined,
		} as GetObjectCommandOutput;
		void expect(objectToNewsletter(getObjectOutput)).resolves.toEqual(
			undefined,
		);
	});

	test('returns undefined when invalid JSON body returned', () => {
		const getObjectOutput = {
			Body: { transformToString: () => Promise.resolve('not json') },
		} as GetObjectCommandOutput;
		void expect(objectToNewsletter(getObjectOutput)).resolves.toEqual(
			undefined,
		);
	});

	test('returns undefined when json is not a newsletter', () => {
		const getObjectOutput = {
			Body: { transformToString: () => Promise.resolve('{"foo": "bar"}') },
		} as GetObjectCommandOutput;
		void expect(objectToNewsletter(getObjectOutput)).resolves.toEqual(
			undefined,
		);
	});

	test('returns newsletter without key where no key is specified', async () => {
		const getObjectOutput = {
			Body: {
				transformToString: () =>
					Promise.resolve(JSON.stringify(TECHSCAPE_IN_NEW_FORMAT)),
			},
		} as GetObjectCommandOutput;
		// What's going on here? The fixture is a NewsletterData object (Containing Dates), what
		// We are storing is JSON, hence the Stringify and Parse.
		const newsletterAsStored = JSON.stringify(TECHSCAPE_IN_NEW_FORMAT);
		const expectedNewsletter = JSON.parse(newsletterAsStored) as NewsletterData;
		const actualNewsletter = await objectToNewsletter(getObjectOutput);
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
		const getObjectOutput = {
			Body: {
				transformToString: () =>
					Promise.resolve(
						JSON.stringify({ ...TECHSCAPE_IN_NEW_FORMAT, meta: storedMeta }),
					),
			},
		} as GetObjectCommandOutput;

		const actualNewsletter = await objectToNewsletter(getObjectOutput);

		expect(actualNewsletter?.meta).toEqual(storedMeta);
	});
});
