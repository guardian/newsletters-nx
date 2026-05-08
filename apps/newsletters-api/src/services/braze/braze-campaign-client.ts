export interface BrazeCampaign {
	id: string;
	name: string;
	is_active: boolean;
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

const fetchCampaignPage = async (
	host: string,
	apiKey: string,
	page: number,
): Promise<BrazeCampaign[]> => {
	const url = new URL('/campaigns/list', host);
	url.searchParams.set('page', String(page));
	url.searchParams.set('per_page', '100');

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

	return data.campaigns.length > 0 ? data.campaigns : [];
};

export const getAllCampaigns = async (): Promise<BrazeCampaign[]> => {
	const { apiKey, host } = getBrazeConfig();

	const allCampaigns: BrazeCampaign[] = [];
	let page = 0;

	let hasMore = true;

	while (hasMore) {
		const campaigns = await fetchCampaignPage(host, apiKey, page);
		allCampaigns.push(...campaigns);

		if (campaigns.length < 100) {
			hasMore = false;
		} else {
			page += 1;
		}
	}

	return allCampaigns;
};

