import type {
	DraftWithIdAndMeta,
	MetaData,
	NewsletterDataWithMeta,
} from '@newsletters-nx/newsletters-data-client';
import { makeBlankMeta } from '@newsletters-nx/newsletters-data-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AllNewslettersData } from './all-newsletters';
import { allNewslettersLoader } from './all-newsletters';
import { fetchDraftNewsletterList, fetchNewsletterList } from './newsletters';

vi.mock('./newsletters', () => ({
	fetchNewsletterList: vi.fn(),
	fetchDraftNewsletterList: vi.fn(),
}));

const mockFetchNewsletterList = vi.mocked(fetchNewsletterList);
const mockFetchDraftNewsletterList = vi.mocked(fetchDraftNewsletterList);

const meta = (updatedTimestamp: number): MetaData => ({
	createdTimestamp: Date.UTC(2025, 0, 1),
	createdBy: 'a@example.com',
	updatedTimestamp,
	updatedBy: 'b@example.com',
});

const launched = (
	identityName: string,
	updatedTimestamp: number,
): NewsletterDataWithMeta =>
	({
		identityName,
		name: identityName,
		category: 'article-based',
		theme: 'news',
		status: 'live',
		meta: meta(updatedTimestamp),
	}) as NewsletterDataWithMeta;

const draft = (
	listId: number | undefined,
	updatedTimestamp: number,
): DraftWithIdAndMeta =>
	({
		listId,
		name: `Draft ${String(listId)}`,
		theme: 'news',
		category: 'other',
		meta: meta(updatedTimestamp),
	}) as DraftWithIdAndMeta;

/**
 * `LoaderFunction` is typed to return `any` (it may return a bare value or a
 * `Response`), so the call is narrowed once here rather than at each use.
 */
const runLoader = async (): Promise<AllNewslettersData> =>
	(await allNewslettersLoader({
		request: new Request('http://localhost/all'),
		params: {},
		context: undefined,
	})) as AllNewslettersData;

beforeEach(() => {
	vi.resetAllMocks();
});

describe('allNewslettersLoader', () => {
	it('combines both sources into one list of rows', async () => {
		mockFetchNewsletterList.mockResolvedValue([launched('politics', 300)]);
		mockFetchDraftNewsletterList.mockResolvedValue([draft(12, 200)]);

		const { rows, failedSources } = await runLoader();

		expect(rows.map((row) => row.id)).toEqual([
			'launched-politics',
			'draft-12',
		]);
		expect(failedSources).toEqual([]);
	});

	it('requests both sources in parallel rather than one after the other', async () => {
		let launchedResolved = false;
		mockFetchNewsletterList.mockImplementation(async () => {
			// Resolves on a later tick, so a sequential loader would not have
			// called the drafts fetch by the time this assertion runs.
			await Promise.resolve();
			launchedResolved = true;
			return [];
		});
		mockFetchDraftNewsletterList.mockImplementation(() => {
			expect(launchedResolved).toBe(false);
			return Promise.resolve([]);
		});

		await runLoader();

		expect(mockFetchNewsletterList).toHaveBeenCalledTimes(1);
		expect(mockFetchDraftNewsletterList).toHaveBeenCalledTimes(1);
	});

	describe('ordering', () => {
		it('puts the most recently updated newsletter first', async () => {
			mockFetchNewsletterList.mockResolvedValue([
				launched('oldest', 100),
				launched('newest', 300),
			]);
			mockFetchDraftNewsletterList.mockResolvedValue([draft(12, 200)]);

			const { rows } = await runLoader();

			expect(rows.map((row) => row.id)).toEqual([
				'launched-newest',
				'draft-12',
				'launched-oldest',
			]);
		});

		it('interleaves launched newsletters and drafts by date, not by source', async () => {
			mockFetchNewsletterList.mockResolvedValue([
				launched('launched-new', 400),
				launched('launched-old', 100),
			]);
			mockFetchDraftNewsletterList.mockResolvedValue([
				draft(1, 300),
				draft(2, 200),
			]);

			const { rows } = await runLoader();

			expect(rows.map((row) => row.id)).toEqual([
				'launched-launched-new',
				'draft-1',
				'draft-2',
				'launched-launched-old',
			]);
		});

		it('sorts newsletters with no known update date last', async () => {
			mockFetchNewsletterList.mockResolvedValue([
				{ ...launched('undated', 0), meta: makeBlankMeta() },
				launched('dated', 100),
			]);
			mockFetchDraftNewsletterList.mockResolvedValue([]);

			const { rows } = await runLoader();

			expect(rows.map((row) => row.id)).toEqual([
				'launched-dated',
				'launched-undated',
			]);
			expect(rows[1]?.lastUpdated).toBeUndefined();
		});
	});

	describe('when a source fails to load', () => {
		it('still shows the drafts when the launched newsletters fail', async () => {
			mockFetchNewsletterList.mockResolvedValue(undefined);
			mockFetchDraftNewsletterList.mockResolvedValue([draft(12, 200)]);

			const { rows, failedSources } = await runLoader();

			expect(rows.map((row) => row.id)).toEqual(['draft-12']);
			expect(failedSources).toEqual(['launched']);
		});

		it('still shows the launched newsletters when the drafts fail', async () => {
			mockFetchNewsletterList.mockResolvedValue([launched('politics', 300)]);
			mockFetchDraftNewsletterList.mockResolvedValue(undefined);

			const { rows, failedSources } = await runLoader();

			expect(rows.map((row) => row.id)).toEqual(['launched-politics']);
			expect(failedSources).toEqual(['draft']);
		});

		it('reports both sources when neither loads', async () => {
			mockFetchNewsletterList.mockResolvedValue(undefined);
			mockFetchDraftNewsletterList.mockResolvedValue(undefined);

			const { rows, failedSources } = await runLoader();

			expect(rows).toEqual([]);
			expect(failedSources).toEqual(['launched', 'draft']);
		});

		it('reports no failures when a source is merely empty', async () => {
			mockFetchNewsletterList.mockResolvedValue([]);
			mockFetchDraftNewsletterList.mockResolvedValue([]);

			const { rows, failedSources } = await runLoader();

			expect(rows).toEqual([]);
			expect(failedSources).toEqual([]);
		});
	});

	it('omits drafts that have no listId, since it is their link target', async () => {
		mockFetchNewsletterList.mockResolvedValue([]);
		mockFetchDraftNewsletterList.mockResolvedValue([
			draft(undefined, 300),
			draft(12, 200),
		]);

		const { rows } = await runLoader();

		expect(rows.map((row) => row.id)).toEqual(['draft-12']);
	});
});
