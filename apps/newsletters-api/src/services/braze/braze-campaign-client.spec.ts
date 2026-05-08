/**
 * Integration tests for braze-campaign-client.
 *
 * These tests make real calls to the Braze API. To run them, set the following
 * environment variables (e.g. in a .env.local file or via the shell):
 *
 *   BRAZE_API_KEY=your-api-key-here
 *   BRAZE_HOST=https://rest.fra-01.braze.eu
 *
 * Tests are skipped automatically when those variables are absent so that CI
 * (which won't have credentials) stays green.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
	type BrazeCampaign,
	fetchCampaignPage,
	getAllCampaigns,
	getBrazeConfig,
} from './braze-campaign-client';

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

const writeFixture = (filename: string, data: unknown): void => {
	fs.mkdirSync(FIXTURES_DIR, { recursive: true });
	fs.writeFileSync(
		path.join(FIXTURES_DIR, filename),
		JSON.stringify(data, null, 2),
		'utf-8',
	);
};

const { BRAZE_API_KEY, BRAZE_HOST } = process.env;
const hasCredentials = Boolean(BRAZE_API_KEY && BRAZE_HOST);
const hasFixtures = fixtureExists('campaign-list-page-0.json');
const canRun = hasCredentials || hasFixtures;

const describeIfCredentials = hasCredentials ? describe : describe.skip;
const describeIfCanRun = canRun ? describe : describe.skip;

describeIfCredentials('getAllCampaigns (real Braze API)', () => {
	let campaigns: BrazeCampaign[];

	beforeAll(async () => {
		campaigns = await getAllCampaigns();
	}, 30_000); // allow up to 30 s for potentially many pages

	it('returns an array', () => {
		expect(Array.isArray(campaigns)).toBe(true);
	});

	it('returns at least one campaign', () => {
		expect(campaigns.length).toBeGreaterThan(0);
	});

	it('every campaign has an id string', () => {
		for (const campaign of campaigns) {
			expect(typeof campaign.id).toBe('string');
			expect(campaign.id.length).toBeGreaterThan(0);
		}
	});

	it('every campaign has a name string', () => {
		for (const campaign of campaigns) {
			expect(typeof campaign.name).toBe('string');
		}
	});

	it('every campaign has a boolean is_active field', () => {
		for (const campaign of campaigns) {
			expect(typeof campaign.is_active).toBe('boolean');
		}
	});
});

describe('getAllCampaigns error handling', () => {
	const ORIGINAL_ENV = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...ORIGINAL_ENV };
	});

	afterEach(() => {
		process.env = ORIGINAL_ENV;
	});

	it('throws a descriptive error when BRAZE_API_KEY is missing', async () => {
		process.env.BRAZE_API_KEY = undefined;
		process.env.BRAZE_HOST = 'https://rest.fra-01.braze.eu';

		// Re-import after resetting modules so the module re-reads process.env
		const { getAllCampaigns: fresh } = await import(
			'./braze-campaign-client'
		);

		await expect(fresh()).rejects.toThrow('BRAZE_API_KEY');
	});

	it('throws a descriptive error when BRAZE_HOST is missing', async () => {
		process.env.BRAZE_API_KEY = 'dummy-key';
		process.env.BRAZE_HOST = undefined;

		const { getAllCampaigns: fresh } = await import(
			'./braze-campaign-client'
		);

		await expect(fresh()).rejects.toThrow('BRAZE_HOST');
	});
});

describeIfCanRun('fetch Braze fixtures (real API — record and replay)', () => {
	it(
		'fetches all campaign list pages and all enabled campaign details',
		async () => {
			const allCampaignIds: string[] = [];
			let page = 0;
			let hasMore = true;

			// ── 1. Paginate /campaigns/list ───────────────────────────────────
			while (hasMore) {
				const filename = `campaign-list-page-${page}.json`;

				let raw: { campaigns: Array<{ id: string; name: string }>; message: string };

				if (fixtureExists(filename)) {
					raw = readFixture(filename);
					console.log(
						`  Page ${page}: loaded ${raw.campaigns.length} campaigns from fixture`,
					);
				} else {
					const { apiKey, host } = getBrazeConfig();
					const result = await fetchCampaignPage(
						host,
						apiKey,
						page,
						false,
					);
					raw = result.raw;
					writeFixture(filename, raw);
					console.log(
						`  Page ${page}: fetched and wrote ${raw.campaigns.length} campaigns`,
					);
				}

				allCampaignIds.push(
				...raw.campaigns
					.filter((c) => c.name?.startsWith('Editorial'))
					.map((c) => c.id),
			);

				if (raw.campaigns.length < 100) {
					hasMore = false;
				} else {
					page += 1;
				}
			}

			console.log(
				`Total campaigns across all pages: ${allCampaignIds.length}`,
			);

			// ── 2. Details for each campaign sequentially ─────────────────────
			let written = 0;
			let skipped = 0;

			for (const campaignId of allCampaignIds) {
				const filename = `campaign-details-${campaignId}.json`;

				if (fixtureExists(filename)) {
					// Already on disk — nothing to do
					written += 1;
					continue;
				}

				const { apiKey, host } = getBrazeConfig();
				const url = new URL('/campaigns/details', host);
				url.searchParams.set('campaign_id', campaignId);
				const response = await fetch(url.toString(), {
					headers: { Authorization: `Bearer ${apiKey}` },
				});
				const details = (await response.json()) as {
					enabled: boolean;
					message: string;
				};

				if (!details.enabled) {
					skipped += 1;
					continue;
				}

				writeFixture(filename, details);
				written += 1;
			}

			console.log(
				`Details written/cached: ${written}, skipped (disabled): ${skipped}`,
			);

			expect(fixtureExists('campaign-list-page-0.json')).toBe(true);
		},
		600_000,
	);
});

