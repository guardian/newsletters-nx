import { TECHSCAPE_IN_NEW_FORMAT } from '../../fixtures/newsletter-fixtures';
import { makeBlankMeta } from '../schemas/meta-data-type';
import type { MetaData } from '../schemas/meta-data-type';
import type { NewsletterData } from '../schemas/newsletter-data-type';
import { dataOf, META, USER } from '../test-helpers/storage-response';
import { InMemoryNewsletterStorage } from './InMemoryNewsletterStorage';

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

describe('newsletter read responses', () => {
	it('include the meta data on the list response', async () => {
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(1, 'one', META),
		]);

		expect(dataOf(await storage.list())[0]?.meta).toEqual(META);
	});

	it('include the meta data on the read response', async () => {
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(1, 'one', META),
		]);

		expect(dataOf(await storage.read(1)).meta).toEqual(META);
	});

	it('include the meta data on the read-by-name response', async () => {
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(1, 'one', META),
		]);

		expect(dataOf(await storage.readByName('one')).meta).toEqual(META);
	});

	it('default the meta data when a record was stored without any', async () => {
		const storage = new InMemoryNewsletterStorage([makeNewsletter(1, 'one')]);

		expect(dataOf(await storage.list())[0]?.meta).toEqual(makeBlankMeta());
	});

	it('reflect an edit made through the app', async () => {
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(1, 'one', META),
		]);

		await storage.update(1, { name: 'a new name' }, USER);

		const newsletter = dataOf(await storage.read(1));

		expect(newsletter.meta.updatedBy).toBe(USER.email);
		expect(newsletter.meta.updatedTimestamp).toBeGreaterThan(
			META.updatedTimestamp,
		);
	});

	it('only partially overrides a blank meta on first edit', async () => {
		// records stored before `meta` existed are defaulted to a blank meta
		// (see makeBlankMeta). Editing them should populate `updatedBy`/
		// `updatedTimestamp`, but there is no way to retroactively know who
		// really created the newsletter, so `createdBy`/`createdTimestamp`
		// stay at their blank sentinel values.
		const blankMeta = makeBlankMeta();
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(1, 'one', blankMeta),
		]);

		await storage.update(1, { name: 'a new name' }, USER);

		const newsletter = dataOf(await storage.read(1));

		expect(newsletter.meta.updatedBy).toBe(USER.email);
		expect(newsletter.meta.updatedTimestamp).toBeGreaterThan(
			blankMeta.updatedTimestamp,
		);
		expect(newsletter.meta.createdBy).toBe(blankMeta.createdBy);
		expect(newsletter.meta.createdTimestamp).toBe(blankMeta.createdTimestamp);
	});
});

describe('inserting a newsletter verbatim', () => {
	it('keeps the supplied meta rather than stamping it for launch', async () => {
		const storage = new InMemoryNewsletterStorage();

		await storage.insertVerbatim(makeNewsletter(1, 'one', META));

		expect(dataOf(await storage.read(1)).meta).toEqual(META);
	});

	it('keeps a status that launching could never produce', async () => {
		const storage = new InMemoryNewsletterStorage();

		await storage.insertVerbatim({
			...makeNewsletter(1, 'one', META),
			status: 'cancelled',
		});

		expect(dataOf(await storage.read(1)).status).toBe('cancelled');
	});

	it('defaults the meta when none is supplied', async () => {
		const storage = new InMemoryNewsletterStorage();

		await storage.insertVerbatim(makeNewsletter(1, 'one'));

		expect(dataOf(await storage.read(1)).meta).toEqual(makeBlankMeta());
	});

	it('makes the newsletter readable by name and in the list', async () => {
		const storage = new InMemoryNewsletterStorage();

		await storage.insertVerbatim(makeNewsletter(1, 'one', META));

		expect(dataOf(await storage.readByName('one')).listId).toBe(1);
		expect(dataOf(await storage.list())).toHaveLength(1);
	});

	it('allocates the next free listId when none is given', async () => {
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(7, 'seven', META),
		]);

		const inserted = dataOf(
			await storage.insertVerbatim({
				...makeNewsletter(7, 'eight', META),
				listId: undefined as unknown as number,
			}),
		);

		expect(inserted.listId).toBe(8);
	});

	it('refuses a duplicate identityName', async () => {
		const storage = new InMemoryNewsletterStorage([
			makeNewsletter(1, 'one', META),
		]);

		const response = await storage.insertVerbatim(
			makeNewsletter(2, 'one', META),
		);

		expect(response.ok).toBe(false);
		expect(dataOf(await storage.list())).toHaveLength(1);
	});

	it('can be removed again, so a test can clean up after itself', async () => {
		const storage = new InMemoryNewsletterStorage();
		await storage.insertVerbatim(makeNewsletter(1, 'one', META));

		await storage.delete(1);

		expect(dataOf(await storage.list())).toHaveLength(0);
	});
});
