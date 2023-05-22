import type { LoaderFunction } from 'react-router-dom';
import { fetchApiData } from '../api-requests/fetch-api-data';

export type RenderingTemplate = {
	id: string;
	status: string;
	title: string;
};

export const renderingTemplateListLoader: LoaderFunction = async (): Promise<
	RenderingTemplate[]
> => {
	const list =
		(await fetchApiData<RenderingTemplate[]>(`api/rendering-templates`)) ?? [];
	return list;
};
