// ── Types ─────────────────────────────────────────────────────────────────────

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

/** Fields extracted from the Liquid template body of the campaign's email message. */
export interface BrazeCampaignExtracted {
	/** Liquid: {% assign identity_newsletter_id = "..." %} */
	identity_newsletter_id: string | undefined;
	/** Liquid: {% assign email_endpoint = "..." %} — path passed to the email rendering service */
	email_endpoint: string | undefined;
	/** Liquid: {% assign email_query = "..." %} — query string appended to the rendering URL */
	email_query: string | undefined;
	/** Liquid: {% assign path_data = "..." %} — legacy alternative to email_endpoint */
	path_data: string | undefined;
	/** The content block name captured into email_content, e.g. "Editorial_Content" */
	email_content_block: string | undefined;
	/** The full URL used to fetch the rendered email, derived from email_content_block + email_endpoint + email_query */
	rendering_url: string | undefined;
}

export interface EnrichedBrazeCampaignDetails extends BrazeCampaignDetails {
	extracted: BrazeCampaignExtracted;
}

// ── Liquid extraction ─────────────────────────────────────────────────────────

const extractLiquidVar = (body: string, varName: string): string | undefined => {
	const match = body.match(new RegExp(`{%\\s*assign\\s+${varName}\\s*=\\s*"([^"]*)"\\s*%}`));
	return match?.[1];
};


const extractEmailContentBlock = (body: string): string | undefined => {
	const captureRe = /\{%-?\s*capture\s+email_content\s*-?%\}([\s\S]*?)\{%-?\s*endcapture/;
	const cbRe = /content_blocks\.\$\{(\w+)}/;
	const captureMatch = captureRe.exec(body);
	if (!captureMatch?.[1]) { return undefined; }
	return cbRe.exec(captureMatch[1])?.[1];
};

// ── Rendering URL ─────────────────────────────────────────────────────────────

const EMAIL_RENDERING_HOST = 'https://email-rendering.guardianapis.com';
const GUARDIAN_HOST = 'https://www.theguardian.com';

/**
 * Returns the URL used to fetch the rendered email from the rendering service,
 * derived from the content block template and campaign-level Liquid variables.
 *
 * Returns undefined if any required variable is missing.
 */
export const getRenderingUrl = (
	campaign: Pick<BrazeCampaignExtracted, 'email_content_block' | 'email_endpoint' | 'email_query'>,
): string | undefined => {
	const { email_content_block, email_endpoint, email_query } = campaign;
	if (!email_endpoint) { return undefined; }

	const withQuery = (base: string) =>
		email_query ? `${base}?${email_query}` : base;

	switch (email_content_block) {
		case 'Editorial_FirstEditionContent':
			return withQuery(`${EMAIL_RENDERING_HOST}/article/${email_endpoint}`);
		case 'Editorial_Content':
			return `${GUARDIAN_HOST}/${email_endpoint}`;
		case 'Editorial_Content_Standard_Template':
			return withQuery(`${EMAIL_RENDERING_HOST}/${email_endpoint}`);
		case 'Editorial_Content_Email_Rendering':
			return withQuery(`${EMAIL_RENDERING_HOST}/fronts/${email_endpoint}`);
		default:
			return undefined;
	}
};

const extractLiquidVarsFromCampaign = (details: BrazeCampaignDetails): BrazeCampaignExtracted => {
	let identity_newsletter_id: string | undefined;
	let email_endpoint: string | undefined;
	let email_query: string | undefined;
	let path_data: string | undefined;
	let email_content_block: string | undefined;

	for (const msg of Object.values(details.messages)) {
		if (!msg.body) { continue; }

		identity_newsletter_id ??= extractLiquidVar(msg.body, 'identity_newsletter_id');
		email_endpoint ??= extractLiquidVar(msg.body, 'email_endpoint');
		email_query ??= extractLiquidVar(msg.body, 'email_query');
		path_data ??= extractLiquidVar(msg.body, 'path_data');
		email_content_block ??= extractEmailContentBlock(msg.body);
	}

	const partial = { identity_newsletter_id, email_endpoint, email_query, path_data, email_content_block };
	return { ...partial, rendering_url: getRenderingUrl(partial) };
};

// ── Config ────────────────────────────────────────────────────────────────────

const getBrazeConfig = (): { apiKey: string; host: string } => {
	const { BRAZE_API_KEY, BRAZE_HOST } = process.env;

	if (!BRAZE_API_KEY) {
		throw new Error('Missing required environment variable: BRAZE_API_KEY');
	}
	if (!BRAZE_HOST) {
		throw new Error('Missing required environment variable: BRAZE_HOST');
	}

	return { apiKey: BRAZE_API_KEY, host: BRAZE_HOST };
};

// ── Retry logic ───────────────────────────────────────────────────────────────

const RETRYABLE_CODES = new Set(['UND_ERR_CONNECT_TIMEOUT', 'ECONNRESET', 'ETIMEDOUT']);

const isRetryable = (err: unknown): boolean => {
	const cause = (err as { cause?: { code?: string } } | undefined)?.cause;
	return Boolean(cause?.code && RETRYABLE_CODES.has(cause.code));
};

const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, label: string, maxAttempts = 3): Promise<T> {
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (err) {
			if (attempt < maxAttempts && isRetryable(err)) {
				const delay = 1000 * 2 ** (attempt - 1); // 1 s, 2 s
				console.warn(`${label}: attempt ${attempt} failed, retrying in ${delay}ms…`);
				await sleep(delay);
			} else {
				throw err;
			}
		}
	}
	throw new Error(`${label}: all ${maxAttempts} attempts failed`);
}

// ── Shared fetch helper ───────────────────────────────────────────────────────

const brazeGet = async <T>(url: URL, apiKey: string, label: string): Promise<T> => {
	const response = await withRetry(
		() => fetch(url.toString(), {
			headers: { Authorization: `Bearer ${apiKey}` },
		}),
		label,
	);

	if (!response.ok) {
		throw new Error(`Braze API error (${label}): ${response.status} ${response.statusText}`);
	}

	const data = (await response.json()) as T & { message: string };

	if (data.message !== 'success') {
		throw new Error(`Braze API unexpected message (${label}): ${data.message}`);
	}

	return data;
};

// ── API functions ─────────────────────────────────────────────────────────────

export const fetchCampaignPage = async (
	host: string,
	apiKey: string,
	page: number,
	includeArchived = true,
): Promise<BrazeCampaign[]> => {
	const url = new URL('/campaigns/list', host);
	url.searchParams.set('page', String(page));
	url.searchParams.set('per_page', '100');
	url.searchParams.set('include_archived', String(includeArchived));

	const data = await brazeGet<BrazeCampaignListResponse>(url, apiKey, `fetchCampaignPage(${page})`);
	return data.campaigns;
};

export const getCampaignDetails = async (campaignId: string): Promise<BrazeCampaignDetails> => {
	const { apiKey, host } = getBrazeConfig();

	const url = new URL('/campaigns/details', host);
	url.searchParams.set('campaign_id', campaignId);

	return brazeGet<BrazeCampaignDetails>(url, apiKey, `getCampaignDetails(${campaignId})`);
};

export const getAllCampaigns = async (): Promise<EnrichedBrazeCampaignDetails[]> => {
	const { apiKey, host } = getBrazeConfig();

	const allCampaigns: BrazeCampaign[] = [];
	let page = 0;

	// Braze paginates in pages of up to 100. A page with fewer than 100
	// results means we've reached the end — there's no explicit "hasMore" flag.
	let hasMore = true;
	while (hasMore) {
		const campaigns = await fetchCampaignPage(host, apiKey, page);

		// We only care about Editorial campaigns; filter before accumulating
		// so we don't request details for campaigns we don't need.
		allCampaigns.push(...campaigns.filter((c) => c.name.startsWith('Editorial')));

		if (campaigns.length < 100) {
			hasMore = false;
		} else {
			page += 1;
		}
	}

	const details = await Promise.all(allCampaigns.map((c) => getCampaignDetails(c.id)));
	return details.map((d) => ({ ...d, extracted: extractLiquidVarsFromCampaign(d) }));
};

export { getBrazeConfig };
