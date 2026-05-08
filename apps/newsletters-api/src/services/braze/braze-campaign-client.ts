export interface BrazeCampaign {
	id: string;
	name: string;
	is_api_campaign: boolean;
	tags: string[];
	last_edited: string;
}

interface BrazeCampaignListResponse {
	campaigns: BrazeCampaign[];
	message: string;
}

const getBrazeConfig = (): { apiKey: string; host: string } => {
	const { BRAZE_API_KEY, BRAZE_HOST } = process.env;

	if (!BRAZE_API_KEY) {
		throw new Error(
			'Missing required environment variable: BRAZE_API_KEY',
		);
	}
	if (!BRAZE_HOST) {
		throw new Error(
			'Missing required environment variable: BRAZE_HOST',
		);
	}

	return { apiKey: BRAZE_API_KEY, host: BRAZE_HOST };
};

export interface CampaignPageResult {
	campaigns: BrazeCampaign[];
	raw: BrazeCampaignListResponse;
}

export const fetchCampaignPage = async (
	host: string,
	apiKey: string,
	page: number,
	includeArchived = true,
): Promise<CampaignPageResult> => {
	const url = new URL('/campaigns/list', host);
	url.searchParams.set('page', String(page));
	url.searchParams.set('per_page', '100');
	url.searchParams.set('include_archived', String(includeArchived));

	let response: Response;
	try {
		response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
		});
	} catch (err) {
		console.error(`Fetch failed for campaigns page ${page}:`, err);
		throw err;
	}

	if (!response.ok) {
		throw new Error(
			`Braze API error fetching campaigns page ${page}: ${response.status} ${response.statusText}`,
		);
	}

	const data = (await response.json()) as BrazeCampaignListResponse;

	if (data.message !== 'success') {
		throw new Error(
			`Braze API returned unexpected message on page ${page}: ${data.message}`,
		);
	}

	return { campaigns: data.campaigns, raw: data };
}

export interface BrazeCampaignMessage {
	channel: string;
	name: string;
	// Control group variants only have channel, name and type
	type?: string;
	subject?: string;
	body?: string;
	from?: string;
	reply_to?: string;
	title?: string | null;
	preheader?: string;
	amp_body?: string;
	custom_plain_text?: string | null;
	should_inline_css?: boolean;
	should_whitespace_preheader?: boolean;
	headers?: Record<string, string> | null;
}

export interface BrazeCampaignDetails {
	message: string;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
	first_sent: string;
	last_sent: string;
	archived: boolean;
	enabled: boolean;
	draft: boolean;
	has_post_launch_draft: boolean;
	schedule_type: string;
	channels: string[];
	tags: string[];
	teams: string[];
	messages: Record<string, BrazeCampaignMessage>;
	conversion_behaviors: Array<{ window: number; type: string }>;
}

const RETRYABLE_CODES = new Set(['UND_ERR_CONNECT_TIMEOUT', 'ECONNRESET', 'ETIMEDOUT']);

const isRetryable = (err: unknown): boolean => {
	if (err && typeof err === 'object' && 'cause' in err) {
		const cause = (err as { cause?: { code?: string } }).cause;
		return Boolean(cause?.code && RETRYABLE_CODES.has(cause.code));
	}
	return false;
};

const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(
	fn: () => Promise<T>,
	label: string,
	maxAttempts = 3,
): Promise<T> {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (err) {
			if (attempt < maxAttempts && isRetryable(err)) {
				const delay = 1000 * 2 ** (attempt - 1); // 1 s, 2 s
				console.warn(
					`${label}: attempt ${attempt} failed (${(err as { cause?: { code?: string } }).cause?.code}), retrying in ${delay}ms…`,
				);
				await sleep(delay);
			} else {
				throw err;
			}
		}
	}
	// unreachable, but satisfies TypeScript
	throw new Error(`${label}: all ${maxAttempts} attempts failed`);
}

async function pMap<T, U>(
	items: T[],
	fn: (item: T) => Promise<U>,
	concurrency: number,
): Promise<U[]> {
	const results: U[] = [];
	for (const item of items) {
		results.push(await fn(item));
	}
	return results;
}

export const getCampaignDetails = async (
	campaignId: string,
): Promise<BrazeCampaignDetails> => {
	const { apiKey, host } = getBrazeConfig();

	const url = new URL('/campaigns/details', host);
	url.searchParams.set('campaign_id', campaignId);

	let response: Response;
	try {
		response = await withRetry(
			() =>
				fetch(url.toString(), {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${apiKey}`,
						'Content-Type': 'application/json',
					},
				}),
			`getCampaignDetails(${campaignId})`,
		);
	} catch (err) {
		console.error(`Fetch failed for campaign details ${campaignId}:`, err);
		throw err;
	}

	if (!response.ok) {
		throw new Error(
			`Braze API error fetching campaign details for ${campaignId}: ${response.status} ${response.statusText}`,
		);
	}

	const data = (await response.json()) as BrazeCampaignDetails;

	if (data.message !== 'success') {
		throw new Error(
			`Braze API returned unexpected message for campaign ${campaignId}: ${data.message}`,
		);
	}

	return data;
};

export const getAllCampaigns = async (): Promise<BrazeCampaignDetails[]> => {
	const { apiKey, host } = getBrazeConfig();

	const allCampaigns: BrazeCampaign[] = [];
	let page = 0;
	let hasMore = true;

	while (hasMore) {
		const { campaigns } = await fetchCampaignPage(host, apiKey, page);
		allCampaigns.push(...campaigns);

		if (campaigns.length < 100) {
			hasMore = false;
		} else {
			page += 1;
		}
	}

	return pMap(allCampaigns, (c) => getCampaignDetails(c.id), 5);
};

export { getBrazeConfig };
