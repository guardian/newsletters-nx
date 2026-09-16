import { TECHSCAPE_IN_NEW_FORMAT } from '../../fixtures/newsletter-fixtures';
import type { MetaData } from '../schemas/meta-data-type';
import {
	deriveUpdatedTimestamp,
	makeBlankMeta,
	MIGRATION_TIMESTAMP_VALUE,
} from '../schemas/meta-data-type';
import type { NewsletterData } from '../schemas/newsletter-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import type { UserProfile } from '../user-profile';
import { InMemoryNewsletterStorage } from './InMemoryNewsletterStorage';

const USER: UserProfile = { email: 'editor@example.com' };

const makeNewsletter = (
	listId: number,
	identityName: string,
	meta?: MetaData,
): NewsletterData & { meta?: MetaData } => ({
	...TECHSCAPE_IN_NEW_FORMAT,
	listId,
	identityName,
	meta,
});

const dataOf = <T>(
	response: SuccessfulStorageResponse<T> | UnsuccessfulStorageResponse,
): T => {
	if (!response.ok) {
		throw new Error(`expected a successful response: ${response.message}`);
	}
	return response.data;
};

describe('InMemoryNewsletterStorage seed data', () => {
	it('gives seeded newsletters a usable last-updated date rather than blank meta', async () => {
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(1, 'one'),
			makeNewsletter(2, 'two'),
		]);

		const [first, second] = dataOf(await storage.list());

		expect(deriveUpdatedTimestamp(first?.meta)).toBeDefined();
		expect(deriveUpdatedTimestamp(second?.meta)).toBeDefined();
		expect(first?.meta.updatedTimestamp).not.toBe(
			second?.meta.updatedTimestamp,
		);
	});

	it('keeps meta data that is supplied with the seed record', async () => {
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(1, 'one', makeBlankMeta()),
		]);

		expect(dataOf(await storage.list())[0]?.meta).toEqual(makeBlankMeta());
	});
});

describe('newsletter read responses', () => {
	it('include the meta data on the list response', async () => {
		const storage = new InMemoryNewsletterStorage([makeNewsletter(1, 'one')]);

		const [newsletter] = dataOf(await storage.list());

		expect(typeof newsletter?.meta.updatedTimestamp).toBe('number');
	});

	it('include the meta data on the read-by-name response', async () => {
		const storage = new InMemoryNewsletterStorage([makeNewsletter(1, 'one')]);

		const newsletter = dataOf(await storage.readByName('one'));

		expect(typeof newsletter.meta.updatedTimestamp).toBe('number');
	});

	it('report no last-updated date for a record whose meta was never written', async () => {
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(1, 'one', makeBlankMeta()),
		]);

		const [newsletter] = dataOf(await storage.list());

		expect(deriveUpdatedTimestamp(newsletter?.meta)).toBeUndefined();
	});

	it('report no last-updated date for a legacy migrated record', async () => {
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(1, 'one', {
				...makeBlankMeta(),
				updatedTimestamp: MIGRATION_TIMESTAMP_VALUE,
			}),
		]);

		const [newsletter] = dataOf(await storage.list());

		expect(deriveUpdatedTimestamp(newsletter?.meta)).toBeUndefined();
	});

	it('reflect an edit made through the app', async () => {
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(1, 'one', makeBlankMeta()),
		]);

		await storage.update(1, { name: 'a new name' }, USER);

		const [newsletter] = dataOf(await storage.list());

		expect(deriveUpdatedTimestamp(newsletter?.meta)).toBeGreaterThan(
			MIGRATION_TIMESTAMP_VALUE,
		);
		expect(newsletter?.meta.updatedBy).toBe(USER.email);
	});
});
