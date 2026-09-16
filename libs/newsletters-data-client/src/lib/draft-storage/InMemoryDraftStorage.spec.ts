import { makeBlankMeta } from '../schemas/meta-data-type';
import type { MetaData } from '../schemas/meta-data-type';
import { dataOf, META, USER } from '../test-helpers/storage-response';
import type { DraftWithId } from './DraftStorage';
import { InMemoryDraftStorage } from './InMemoryDraftStorage';

const makeDraft = (
	listId: number,
	meta?: MetaData,
): DraftWithId & { meta?: MetaData } => ({
	listId,
	name: `draft ${listId}`,
	category: 'other',
	creationTimeStamp: 1633539258449,
	meta,
});

describe('draft read responses', () => {
	it('include the meta data on the list response', async () => {
		const storage = new InMemoryDraftStorage([makeDraft(1, META)]);

		expect(dataOf(await storage.readAll())[0]?.meta).toEqual(META);
	});

	it('include the meta data on the single read response', async () => {
		const storage = new InMemoryDraftStorage([makeDraft(1, META)]);

		expect(dataOf(await storage.read(1)).meta).toEqual(META);
	});

	it('default the meta data when a draft was stored without any', async () => {
		const storage = new InMemoryDraftStorage([makeDraft(1)]);

		expect(dataOf(await storage.readAll())[0]?.meta).toEqual(makeBlankMeta());
	});

	it('reflect an edit made through the app', async () => {
		const storage = new InMemoryDraftStorage([makeDraft(1, META)]);

		await storage.update({ ...makeDraft(1, META), name: 'a new name' }, USER);

		const draft = dataOf(await storage.read(1));

		expect(draft.meta.updatedBy).toBe(USER.email);
		expect(draft.meta.updatedTimestamp).toBeGreaterThan(META.updatedTimestamp);
	});
});
