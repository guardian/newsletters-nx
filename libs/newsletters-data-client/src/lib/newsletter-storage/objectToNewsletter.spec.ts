import type { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { TECHSCAPE_IN_NEW_FORMAT } from '../../fixtures/newsletter-fixtures';
import type { NewsletterData } from '../newsletter-data-type';
import { objectToNewsletter } from './objectToNewsletter';

describe('objectToNewsletter', () => {
	test('returns undefined when getObjectOutput.Body is undefined', () => {
		const getObjectOutput = {
			Body: undefined,
		} as GetObjectCommandOutput;
		void expect(
			objectToNewsletter(getObjectOutput, undefined),
		).resolves.toEqual(undefined);
	});

	test('returns undefined when invalid JSON body returned', () => {
		const getObjectOutput = {
			Body: { transformToString: () => Promise.resolve('not json') },
		} as GetObjectCommandOutput;
		void expect(
			objectToNewsletter(getObjectOutput, undefined),
		).resolves.toEqual(undefined);
	});

	test('returns undefined when json is not a newsletter', () => {
		const getObjectOutput = {
			Body: { transformToString: () => Promise.resolve('{"foo": "bar"}') },
		} as GetObjectCommandOutput;
		void expect(
			objectToNewsletter(getObjectOutput, undefined),
		).resolves.toEqual(undefined);
	});

	test('returns newsletter without key where no key is specified', async () => {
		const getObjectOutput = {
			Body: {
				transformToString: () =>
					Promise.resolve(JSON.stringify(TECHSCAPE_IN_NEW_FORMAT)),
			},
		} as GetObjectCommandOutput;
		const newsletterAsStored = JSON.stringify({
			...TECHSCAPE_IN_NEW_FORMAT,
			key: undefined,
		});
		const expectedNewsletter = JSON.parse(newsletterAsStored) as NewsletterData;
		const actualNewsletter = await objectToNewsletter(
			getObjectOutput,
			undefined,
		);
		expect(actualNewsletter).toEqual(expectedNewsletter);
	});

	test('returns newsletter with a key where specified', async () => {
		const getObjectOutput = {
			Body: {
				transformToString: () =>
					Promise.resolve(JSON.stringify(TECHSCAPE_IN_NEW_FORMAT)),
			},
		} as GetObjectCommandOutput;
		const newsletterAsStored = JSON.stringify({
			...TECHSCAPE_IN_NEW_FORMAT,
			key: 'someKey',
		});
		const expectedNewsletter = JSON.parse(newsletterAsStored) as NewsletterData;
		const actualNewsletter = await objectToNewsletter(
			getObjectOutput,
			'someKey',
		);
		expect(actualNewsletter).toEqual(expectedNewsletter);
	});
});
