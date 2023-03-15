import type { LoaderFunction } from 'react-router';
import type {
	ApiResponse,
	Draft,
	NewsletterData,
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

export const listLoader: LoaderFunction = async (): Promise<
	NewsletterData[]
> => {
	const list = (await fetchApiData<NewsletterData[]>(`api/newsletters`)) ?? [];
	return list;
};

export const detailLoader: LoaderFunction = async ({
	params,
}): Promise<NewsletterData | undefined> => {
	const { id } = params;
	if (!id) {
		return undefined;
	}
	return await fetchApiData<NewsletterData>(`api/newsletters/${id}`);
};

export const draftListLoader: LoaderFunction = async (): Promise<Draft[]> => {
	const list = (await fetchApiData<Draft[]>(`api/drafts`)) ?? [];
	return list;
};

export const draftDetailLoader: LoaderFunction = async ({
	params,
}): Promise<Draft | undefined> => {
	const { id } = params;
	if (!id) {
		return undefined;
	}
	return await fetchApiData<Draft>(`api/drafts/${id}`);
};
