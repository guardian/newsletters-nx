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
});
