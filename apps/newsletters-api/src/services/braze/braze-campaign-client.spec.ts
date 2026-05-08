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
	type BrazeCampaignExtracted,
	type EnrichedBrazeCampaignDetails,
	getAllCampaigns,
} from './braze-campaign-client';

// ── Fixture helpers ───────────────────────────────────────────────────────────

const FIXTURES_DIR = path.resolve(__dirname, '../../../../../test/fixtures/raw');

const fixtureExists = (filename: string): boolean =>
	fs.existsSync(path.join(FIXTURES_DIR, filename));

const readFixture = <T>(filename: string): T =>
	JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, filename), 'utf-8')) as T;

// ── fetch mock ────────────────────────────────────────────────────────────────

/**
 * Intercept every fetch call and serve responses from fixture files.
 *
 * /campaigns/list    → campaign-list-page-{page}.json
 *                      Falls back to an empty last-page response when missing.
 * /campaigns/details → campaign-details-{id}.json
 *                      Throws if the fixture is missing so gaps surface loudly.
 */
const mockFetchFromFixtures = (): jest.SpyInstance =>
	jest.spyOn(global, 'fetch').mockImplementation((input: RequestInfo | URL) => {
		const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);

		if (url.pathname === '/campaigns/list') {
			const page = url.searchParams.get('page') ?? '0';
			const filename = `campaign-list-page-${page}.json`;
			const body = fixtureExists(filename)
				? readFixture<unknown>(filename)
				: { campaigns: [], message: 'success' };

			return Promise.resolve(new Response(JSON.stringify(body), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}));
		}

		if (url.pathname === '/campaigns/details') {
			const id = url.searchParams.get('campaign_id') ?? '';
			const filename = `campaign-details-${id}.json`;

			if (!fixtureExists(filename)) {
				return Promise.reject(new Error(`No fixture found for campaign details: ${id} (${filename})`));
			}

			return Promise.resolve(new Response(JSON.stringify(readFixture<unknown>(filename)), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}));
		}

		return Promise.reject(new Error(`Unexpected URL in fetch mock: ${url.toString()}`));
	});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getAllCampaigns', () => {
	let campaigns: EnrichedBrazeCampaignDetails[];
	let fetchSpy: jest.SpyInstance;

	beforeAll(async () => {
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

	it('returns a non-empty array', () => {
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

	it('every campaign has an extracted object', () => {
		for (const campaign of campaigns) {
			expect(typeof campaign.extracted).toBe('object');
		}
	});

	it('every extracted object has the expected fields', () => {
		const optionalString = (v: unknown) =>
			v === undefined || typeof v === 'string';

		for (const campaign of campaigns) {
			const e: BrazeCampaignExtracted = campaign.extracted;
			expect(optionalString(e.identity_newsletter_id)).toBe(true);
			expect(optionalString(e.email_endpoint)).toBe(true);
			expect(optionalString(e.email_query)).toBe(true);
			expect(optionalString(e.path_data)).toBe(true);
			expect(optionalString(e.email_content_block)).toBe(true);
			expect(optionalString(e.rendering_url)).toBe(true);
		}
	});

	it('email_query is only present when email_endpoint is also present', () => {
		for (const { extracted: e } of campaigns) {
			if (e.email_query !== undefined) {
				expect(e.email_endpoint).toBeDefined();
			}
		}
	});

	it('rendering_url is a valid URL when present', () => {
		for (const { extracted: e } of campaigns) {
			if (e.rendering_url !== undefined) {
				expect(() => new URL(e.rendering_url as string)).not.toThrow();
			}
		}
	});

	it('rendering_url is present whenever email_content_block and email_endpoint are both set', () => {
		for (const { extracted: e } of campaigns) {
			if (e.email_content_block !== undefined && e.email_endpoint !== undefined) {
				expect(e.rendering_url).toBeDefined();
			}
		}
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

	it('throws when BRAZE_API_KEY is missing', async () => {
		delete process.env.BRAZE_API_KEY;
		process.env.BRAZE_HOST = 'https://rest.fra-01.braze.eu';

		await expect(getAllCampaigns()).rejects.toThrow('BRAZE_API_KEY');
	});

	it('throws when BRAZE_HOST is missing', async () => {
		process.env.BRAZE_API_KEY = 'dummy-key';
		delete process.env.BRAZE_HOST;

		await expect(getAllCampaigns()).rejects.toThrow('BRAZE_HOST');
	});
});

