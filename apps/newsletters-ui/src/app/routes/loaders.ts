import type { LoaderFunction } from 'react-router';
import type {
	ApiResponse,
	Newsletter,
} from '@newsletters-nx/newsletters-data-client';

async function fetchApiData<T>(path: string): Promise<T | undefined> {
	try {
		const response = await fetch(path);
		const data = (await response.json()) as ApiResponse<T>;
		return data.ok ? data.data : undefined;
	} catch (err) {
		console.error(err);
		return undefined;
	}
}

async function getNewsletters(): Promise<Newsletter[]> {
	return (await fetchApiData<Newsletter[]>(`api/v1/newsletters`)) ?? [];
}

async function getNewsletter(id: string): Promise<Newsletter | undefined> {
	return await fetchApiData<Newsletter>(`api/v1/newsletters/${id}`);
}

export const listLoader: LoaderFunction = async (): Promise<Newsletter[]> => {
	const list = await getNewsletters();
	return list;
};

export const detailLoader: LoaderFunction = async ({
	params,
}): Promise<Newsletter | undefined> => {
	const { id } = params;
	if (!id) {
		return undefined;
	}
	return getNewsletter(id);
};
