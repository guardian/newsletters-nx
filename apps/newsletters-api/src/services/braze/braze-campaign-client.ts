export interface BrazeCampaign {
	id: string;
	name: string;
	is_active: boolean;
	tags: string[];
	[key: string]: unknown;
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

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
	});

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
};

export interface BrazeCampaignDetails {
	message: string;
	name: string;
	enabled: boolean;
	messages: Record<string, Record<string, unknown>>;
	[key: string]: unknown;
}

export const getCampaignDetails = async (
	campaignId: string,
): Promise<BrazeCampaignDetails> => {
	const { apiKey, host } = getBrazeConfig();

	const url = new URL('/campaigns/details', host);
	url.searchParams.set('campaign_id', campaignId);

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
	});

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

const isEditorialAndActive = (campaign: BrazeCampaign): boolean =>
	campaign.is_active &&
	campaign.name.startsWith('Editorial') &&
	campaign.tags.includes('Type/Editorial');

export const getAllCampaigns = async (): Promise<BrazeCampaign[]> => {
	const { apiKey, host } = getBrazeConfig();

	const allCampaigns: BrazeCampaign[] = [];
	let page = 0;
	let hasMore = true;

	while (hasMore) {
		const { campaigns } = await fetchCampaignPage(host, apiKey, page);
		allCampaigns.push(...campaigns.filter(isEditorialAndActive));

		if (campaigns.length < 100) {
			hasMore = false;
		} else {
			page += 1;
		}
	}

	return allCampaigns;
};

export { getBrazeConfig };
