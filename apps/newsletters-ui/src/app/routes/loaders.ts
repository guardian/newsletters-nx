import type { LoaderFunction } from 'react-router';
import type {
	ApiResponse,
	Draft,
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

export const listLoader: LoaderFunction = async (): Promise<Newsletter[]> => {
	const list = (await fetchApiData<Newsletter[]>(`api/v1/newsletters`)) ?? [];
	return list;
};

export const detailLoader: LoaderFunction = async ({
	params,
}): Promise<Newsletter | undefined> => {
	const { id } = params;
	if (!id) {
		return undefined;
	}
	return await fetchApiData<Newsletter>(`api/v1/newsletters/${id}`);
};

export const draftListLoader: LoaderFunction = async (): Promise<Draft[]> => {
	const list = (await fetchApiData<Draft[]>(`api/v1/drafts`)) ?? [];
	return list;
};

export const draftDetailLoader: LoaderFunction = async ({
	params,
}): Promise<Draft | undefined> => {
	const { id } = params;
	if (!id) {
		return undefined;
	}
	return await fetchApiData<Draft>(`api/v1/drafts/${id}`);
};
