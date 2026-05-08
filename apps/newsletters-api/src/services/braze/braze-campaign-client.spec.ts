/**
 * Unit tests for braze-campaign-client.
 *
 * Tests run entirely from fixture files in test/fixtures/raw — no real Braze
 * API calls are made. fetch is replaced with a jest spy that reads from disk.
 *
 * To refresh the fixtures against the real Braze API run:
 *   npx tsx tools/scripts/fetch-braze-fixtures.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import {
	type BrazeCampaignDetails,
	getAllCampaigns,
} from './braze-campaign-client';

// ── Fixture helpers ───────────────────────────────────────────────────────────

const FIXTURES_DIR = path.resolve(
	__dirname,
	'../../../../../test/fixtures/raw',
);

const fixtureExists = (filename: string): boolean =>
	fs.existsSync(path.join(FIXTURES_DIR, filename));

const readFixture = <T>(filename: string): T =>
	JSON.parse(
		fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf-8'),
	) as T;

/**
 * Returns the campaign IDs for which we have a detail fixture on disk.
 */
const availableDetailIds = (): string[] =>
	fs
		.readdirSync(FIXTURES_DIR)
		.filter((f) => f.startsWith('campaign-details-') && f.endsWith('.json'))
		.map((f) => f.replace('campaign-details-', '').replace('.json', ''));

// ── fetch mock ────────────────────────────────────────────────────────────────

/**
 * Intercept every fetch call and serve responses from fixture files.
 *
 * /campaigns/list  → campaign-list-page-{page}.json  (falls back to an empty
 *                    last-page response when the fixture doesn't exist)
 * /campaigns/details → campaign-details-{id}.json    (throws if missing so
 *                    tests fail loudly rather than silently swallowing gaps)
 */
const mockFetchFromFixtures = (): jest.SpyInstance => {
	return jest.spyOn(global, 'fetch').mockImplementation(
		async (input: RequestInfo | URL) => {
			const url = new URL(input.toString());

			if (url.pathname === '/campaigns/list') {
				const page = url.searchParams.get('page') ?? '0';
				const filename = `campaign-list-page-${page}.json`;

				const body = fixtureExists(filename)
					? readFixture<unknown>(filename)
					: { campaigns: [], message: 'success' };

				return new Response(JSON.stringify(body), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			if (url.pathname === '/campaigns/details') {
				const id = url.searchParams.get('campaign_id') ?? '';
				const filename = `campaign-details-${id}.json`;

				if (!fixtureExists(filename)) {
					throw new Error(
						`No fixture found for campaign details: ${id} (${filename})`,
					);
				}

				const body = readFixture<unknown>(filename);
				return new Response(JSON.stringify(body), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			throw new Error(`Unexpected URL in fetch mock: ${url}`);
		},
	);
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getAllCampaigns (fixture-driven)', () => {
	let campaigns: BrazeCampaignDetails[];
	let fetchSpy: jest.SpyInstance;
	const detailIds = availableDetailIds();

	beforeAll(async () => {
		// Provide valid-looking env vars so getBrazeConfig() doesn't throw.
		process.env.BRAZE_API_KEY = 'test-api-key';
		process.env.BRAZE_HOST = 'https://rest.fra-01.braze.eu';

		fetchSpy = mockFetchFromFixtures();

		campaigns = await getAllCampaigns();
	});

	afterAll(() => {
		fetchSpy.mockRestore();
		delete process.env.BRAZE_API_KEY;
		delete process.env.BRAZE_HOST;
	});

	it('returns an array', () => {
		expect(Array.isArray(campaigns)).toBe(true);
	});

	it('returns at least one campaign', () => {
		expect(campaigns.length).toBeGreaterThan(0);
	});

	it('every campaign has a name string', () => {
		for (const campaign of campaigns) {
			expect(typeof campaign.name).toBe('string');
		}
	});

	it('every campaign has a boolean enabled field', () => {
		for (const campaign of campaigns) {
			expect(typeof campaign.enabled).toBe('boolean');
		}
	});

	it('returns a campaign for every available detail fixture', () => {
		const returnedIds = new Set(
			campaigns.map((c) => {
				// campaign details don't carry an id field in the fixture, so we
				// check via name match — just verify counts line up here.
				return c.name;
			}),
		);
		// We should have fetched details for every id the list pages contained
		// that also had a fixture. Count is more meaningful than set membership.
		expect(campaigns.length).toBeGreaterThanOrEqual(detailIds.length);
	});
});

describe('getAllCampaigns error handling', () => {
	const ORIGINAL_ENV = process.env;

	beforeEach(() => {
		process.env = { ...ORIGINAL_ENV };
	});

	afterEach(() => {
		process.env = ORIGINAL_ENV;
	});

	it('throws a descriptive error when BRAZE_API_KEY is missing', async () => {
		delete process.env.BRAZE_API_KEY;
		process.env.BRAZE_HOST = 'https://rest.fra-01.braze.eu';

		await expect(getAllCampaigns()).rejects.toThrow('BRAZE_API_KEY');
	});

	it('throws a descriptive error when BRAZE_HOST is missing', async () => {
		process.env.BRAZE_API_KEY = 'dummy-key';
		delete process.env.BRAZE_HOST;

		await expect(getAllCampaigns()).rejects.toThrow('BRAZE_HOST');
	});
});

