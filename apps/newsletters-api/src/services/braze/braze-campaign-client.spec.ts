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

import { type BrazeCampaign, getAllCampaigns } from './braze-campaign-client';

const { BRAZE_API_KEY, BRAZE_HOST } = process.env;
const hasCredentials = Boolean(BRAZE_API_KEY && BRAZE_HOST);

const describeIfCredentials = hasCredentials ? describe : describe.skip;

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

