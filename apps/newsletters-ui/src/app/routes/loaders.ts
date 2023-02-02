import type { LoaderFunction } from 'react-router';
import type {
	ApiResponse,
	Newsletter,
} from '@newsletters-nx/newsletters-data-client';

async function getNewsletters(): Promise<Newsletter[]> {
	try {
		const response = await fetch('api/v1/newsletters');
		const data = (await response.json()) as ApiResponse<Newsletter[]>;
		return data.ok ? data.data : [];
	} catch (err) {
		console.error(err);
		return [];
	}
}

export const listLoader: LoaderFunction = async (): Promise<Newsletter[]> => {
	const list = await getNewsletters();
	return list;
};

// TO DO - use the /newsletter/:id api route when available
export const detailLoader: LoaderFunction = async ({
	params,
}): Promise<Newsletter | undefined> => {
	const items = await getNewsletters();
	const match = items.find((item) => item.identityName === params.id);
	return match;
};
