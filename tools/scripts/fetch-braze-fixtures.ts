#!/usr/bin/env tsx
/**
 * Fetches campaign data from the real Braze API and writes fixture files to
 * test/fixtures/raw/.  Existing files are left untouched (delete them first if
 * you want to force a refresh).
 *
 * Usage:
 *   BRAZE_API_KEY=<key> BRAZE_HOST=https://rest.fra-01.braze.eu \
 *     npx tsx tools/scripts/fetch-braze-fixtures.ts
 *
 * Only "Editorial" campaigns are fetched for the details step (matching the
 * original filtering logic).
 */

import * as fs from 'fs';
import * as path from 'path';

const FIXTURES_DIR = path.resolve(
	__dirname,
	'../../test/fixtures/raw',
);

// ── Config ────────────────────────────────────────────────────────────────────

const { BRAZE_API_KEY, BRAZE_HOST } = process.env;

if (!BRAZE_API_KEY) {
	console.error('Error: BRAZE_API_KEY environment variable is required.');
	process.exit(1);
}
if (!BRAZE_HOST) {
	console.error('Error: BRAZE_HOST environment variable is required.');
	process.exit(1);
}

const apiKey: string = BRAZE_API_KEY;
const host: string = BRAZE_HOST;

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {

	// ── Step 1: paginate /campaigns/list ───────────────────────────────────────

	console.log('── Fetching campaign list pages ──────────────────────────────');

	const editorialCampaignIds: string[] = [];
	let page = 0;
	let hasMore = true;

	while (hasMore) {
		const filename = `campaign-list-page-${page}.json`;

		let raw: { campaigns: Array<{ id: string; name: string }>; message: string };

		if (fixtureExists(filename)) {
			raw = readFixture(filename);
			console.log(
				`  Page ${page}: loaded ${raw.campaigns.length} campaigns from existing fixture`,
			);
		} else {
			const url = new URL('/campaigns/list', host);
			url.searchParams.set('page', String(page));
			url.searchParams.set('per_page', '100');
			url.searchParams.set('include_archived', 'false');

			const response = await fetch(url.toString(), {
				headers: { Authorization: `Bearer ${apiKey}` },
			});

			if (!response.ok) {
				throw new Error(
					`Braze API error on campaign list page ${page}: ${response.status} ${response.statusText}`,
				);
			}

			raw = (await response.json()) as typeof raw;

			if (raw.message !== 'success') {
				throw new Error(
					`Unexpected message on page ${page}: ${raw.message}`,
				);
			}

			writeFixture(filename, raw);
			console.log(
				`  Page ${page}: fetched and wrote ${raw.campaigns.length} campaigns`,
			);
		}

		editorialCampaignIds.push(
			...raw.campaigns
				.filter((c) => c.name.startsWith('Editorial'))
				.map((c) => c.id),
		);

		if (raw.campaigns.length < 100) {
			hasMore = false;
		} else {
			page += 1;
		}
	}

	console.log(`\nEditorial campaigns found: ${editorialCampaignIds.length}`);

	// ── Step 2: fetch details for each Editorial campaign ──────────────────────

	console.log('\n── Fetching campaign details ──────────────────────────────────');

	let written = 0;
	let cached = 0;
	let skipped = 0;

	for (const campaignId of editorialCampaignIds) {
		const filename = `campaign-details-${campaignId}.json`;

		if (fixtureExists(filename)) {
			cached += 1;
			continue;
		}

		try {
			const url = new URL('/campaigns/details', host);
			url.searchParams.set('campaign_id', campaignId);

			const response = await fetch(url.toString(), {
				headers: { Authorization: `Bearer ${apiKey}` },
			});

			if (!response.ok) {
				console.warn(
					`  Skipping ${campaignId}: HTTP ${response.status} ${response.statusText}`,
				);
				skipped += 1;
				continue;
			}

			const details = (await response.json()) as {
				enabled: boolean;
				message: string;
			};

			if (details.message !== 'success') {
				console.warn(
					`  Skipping ${campaignId}: unexpected message "${details.message}"`,
				);
				skipped += 1;
				continue;
			}


			writeFixture(filename, details);
			written += 1;
		} catch (err) {
			console.warn(`  Error fetching ${campaignId}:`, err);
			skipped += 1;
		}

		// Be polite to the API — small delay between detail requests.
		await sleep(50);
	}

	console.log(
		`\nDone. Written: ${written}, already cached: ${cached}, skipped (disabled/error): ${skipped}`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
