import type { LoaderFunction } from 'react-router';
import type {
	EditionsLayouts,
	Layout,
} from '@newsletters-nx/newsletters-data-client';
import { fetchApiData } from '../api-requests/fetch-api-data';

export const mapLoader: LoaderFunction = async (): Promise<EditionsLayouts> => {
	const map = (await fetchApiData<EditionsLayouts>(`api/layouts`)) ?? {};
	return map;
};

export const layoutLoader: LoaderFunction = async ({
	params,
}): Promise<Layout | undefined> => {
	const { id } = params;
	if (!id) {
		return undefined;
	}
	return await fetchApiData<Layout | undefined>(`api/layouts/${id}`);
};
