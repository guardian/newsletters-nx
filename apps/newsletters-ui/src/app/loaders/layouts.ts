import type { LoaderFunction } from 'react-router';
import type {
	EditionsLayouts,
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { fetchApiData } from '../api-requests/fetch-api-data';

export const mapLoader: LoaderFunction = async (): Promise<{
	editionsLayouts: EditionsLayouts;
	newsletters: NewsletterData[];
}> => {
	const [editionsLayouts = {}, newsletters = []] = await Promise.all([
		fetchApiData<EditionsLayouts>(`api/layouts`),
		fetchApiData<NewsletterData[]>(`api/newsletters`),
	]);

	return { editionsLayouts, newsletters };
};

export const layoutLoader: LoaderFunction = async ({
	params,
}): Promise<{ layout: Layout; newsletters: NewsletterData[] } | undefined> => {
	const { id } = params;
	if (!id) {
		return undefined;
	}

	const [layout, newsletters] = await Promise.all([
		fetchApiData<Layout | undefined>(`api/layouts/${id}`),
		fetchApiData<NewsletterData[]>(`api/newsletters`),
	]);

	if (!layout || !newsletters) {
		return undefined;
	}

	return { layout, newsletters };
};
