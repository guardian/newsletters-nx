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

// LoaderFunction returns `any`; narrow the cast once here rather than at each use.
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

	describe('ordering', () => {
		it.each([
			{
				name: 'puts the most recently updated newsletter first',
				launchedList: [launched('oldest', 100), launched('newest', 300)],
				draftList: [draft(12, 200)],
				expectedIds: ['launched-newest', 'draft-12', 'launched-oldest'],
			},
			{
				name: 'interleaves launched newsletters and drafts by date, not by source',
				launchedList: [
					launched('launched-new', 400),
					launched('launched-old', 100),
				],
				draftList: [draft(1, 300), draft(2, 200)],
				expectedIds: [
					'launched-launched-new',
					'draft-1',
					'draft-2',
					'launched-launched-old',
				],
			},
			{
				name: 'sorts newsletters with no known update date last',
				launchedList: [
					{ ...launched('undated', 0), meta: makeBlankMeta() },
					launched('dated', 100),
				],
				draftList: [],
				expectedIds: ['launched-dated', 'launched-undated'],
			},
			{
				name: 'breaks ties on the same update date by id, for a deterministic order',
				launchedList: [
					{ ...launched('b', 0), meta: makeBlankMeta() },
					{ ...launched('a', 0), meta: makeBlankMeta() },
				],
				draftList: [],
				expectedIds: ['launched-a', 'launched-b'],
			},
		])('$name', async ({ launchedList, draftList, expectedIds }) => {
			mockFetchNewsletterList.mockResolvedValue(launchedList);
			mockFetchDraftNewsletterList.mockResolvedValue(draftList);

			const { rows } = await runLoader();

			expect(rows.map((row) => row.id)).toEqual(expectedIds);
		});

		it('reports no last-updated date for a newsletter with none known', async () => {
			mockFetchNewsletterList.mockResolvedValue([
				{ ...launched('undated', 0), meta: makeBlankMeta() },
			]);
			mockFetchDraftNewsletterList.mockResolvedValue([]);

			const { rows } = await runLoader();

			expect(rows[0]?.lastUpdated).toBeUndefined();
		});
	});

	describe('when a source fails to load', () => {
		it.each([
			{
				name: 'still shows the drafts when the launched newsletters fail',
				launchedResult: undefined,
				draftResult: [draft(12, 200)],
				expectedIds: ['draft-12'],
				expectedFailedSources: ['launched'],
			},
			{
				name: 'still shows the launched newsletters when the drafts fail',
				launchedResult: [launched('politics', 300)],
				draftResult: undefined,
				expectedIds: ['launched-politics'],
				expectedFailedSources: ['draft'],
			},
			{
				name: 'reports both sources when neither loads',
				launchedResult: undefined,
				draftResult: undefined,
				expectedIds: [],
				expectedFailedSources: ['launched', 'draft'],
			},
			{
				name: 'reports no failures when a source is merely empty',
				launchedResult: [],
				draftResult: [],
				expectedIds: [],
				expectedFailedSources: [],
			},
		])(
			'$name',
			async ({
				launchedResult,
				draftResult,
				expectedIds,
				expectedFailedSources,
			}) => {
				mockFetchNewsletterList.mockResolvedValue(launchedResult);
				mockFetchDraftNewsletterList.mockResolvedValue(draftResult);

				const { rows, failedSources } = await runLoader();

				expect(rows.map((row) => row.id)).toEqual(expectedIds);
				expect(failedSources).toEqual(expectedFailedSources);
			},
		);
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

	it('warns when a draft with no listId is omitted', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
			// suppress console output during the test
		});
		mockFetchNewsletterList.mockResolvedValue([]);
		mockFetchDraftNewsletterList.mockResolvedValue([draft(undefined, 300)]);

		await runLoader();

		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('omitting 1 draft'),
			expect.any(Array),
		);
	});
});
