import type { MetaData } from '../schemas/meta-data-type';
import {
	deriveUpdatedTimestamp,
	makeBlankMeta,
	MIGRATION_TIMESTAMP_VALUE,
} from '../schemas/meta-data-type';
import type {
	SuccessfulStorageResponse,
	UnsuccessfulStorageResponse,
} from '../storage-response-types';
import type { UserProfile } from '../user-profile';
import type { DraftWithId } from './DraftStorage';
import { InMemoryDraftStorage } from './InMemoryDraftStorage';

const USER: UserProfile = { email: 'editor@example.com' };

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

const dataOf = <T>(
	response: SuccessfulStorageResponse<T> | UnsuccessfulStorageResponse,
): T => {
	if (!response.ok) {
		throw new Error(`expected a successful response: ${response.message}`);
	}
	return response.data;
};

describe('InMemoryDraftStorage seed data', () => {
	it('gives seeded drafts a usable last-updated date rather than blank meta', async () => {
		const storage = new InMemoryDraftStorage([makeDraft(1), makeDraft(2)]);

		const [first, second] = dataOf(await storage.readAll());

		expect(deriveUpdatedTimestamp(first?.meta)).toBeDefined();
		expect(deriveUpdatedTimestamp(second?.meta)).toBeDefined();
		expect(first?.meta.updatedTimestamp).not.toBe(second?.meta.updatedTimestamp);
	});

	it('keeps meta data that is supplied with the seed record', async () => {
		const storage = new InMemoryDraftStorage([makeDraft(1, makeBlankMeta())]);

		expect(dataOf(await storage.readAll())[0]?.meta).toEqual(makeBlankMeta());
	});
});

describe('draft read responses', () => {
	it('include the meta data on the list response', async () => {
		const storage = new InMemoryDraftStorage([makeDraft(1)]);

		const [draft] = dataOf(await storage.readAll());

		expect(typeof draft?.meta.updatedTimestamp).toBe('number');
	});

	it('include the meta data on the single read response', async () => {
		const storage = new InMemoryDraftStorage([makeDraft(1)]);

		const draft = dataOf(await storage.read(1));

		expect(typeof draft.meta.updatedTimestamp).toBe('number');
	});

	it('report no last-updated date for a draft whose meta was never written', async () => {
		const storage = new InMemoryDraftStorage([makeDraft(1, makeBlankMeta())]);

		const [draft] = dataOf(await storage.readAll());

		expect(deriveUpdatedTimestamp(draft?.meta)).toBeUndefined();
	});

	it('report no last-updated date for a legacy migrated draft', async () => {
		const storage = new InMemoryDraftStorage([
			makeDraft(1, {
				...makeBlankMeta(),
				updatedTimestamp: MIGRATION_TIMESTAMP_VALUE,
			}),
		]);

		const [draft] = dataOf(await storage.readAll());

		expect(deriveUpdatedTimestamp(draft?.meta)).toBeUndefined();
	});

	it('reflect an edit made through the app', async () => {
		const storage = new InMemoryDraftStorage([makeDraft(1, makeBlankMeta())]);

		await storage.update({ ...makeDraft(1), name: 'a new name' }, USER);

		const [draft] = dataOf(await storage.readAll());

		expect(deriveUpdatedTimestamp(draft?.meta)).toBeGreaterThan(
			MIGRATION_TIMESTAMP_VALUE,
		);
		expect(draft?.meta.updatedBy).toBe(USER.email);
	});
});
