import type { RouteObject } from 'react-router-dom';
import {
	allNewslettersCategoryParam,
	allNewslettersPillarParam,
	allNewslettersSearchParam,
	AllNewslettersView,
} from '../components/views/AllNewslettersView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { allNewslettersLoader } from '../loaders/all-newsletters';

const clientFilterParams = [
	allNewslettersSearchParam,
	allNewslettersCategoryParam,
	allNewslettersPillarParam,
];

const withoutClientFilterParams = (url: URL): string => {
	const params = new URLSearchParams(url.search);
	clientFilterParams.forEach((param) => params.delete(param));
	const query = params.toString();
	return query ? `${url.pathname}?${query}` : url.pathname;
};

export const allNewslettersRoute: RouteObject = {
	path: '/all',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <AllNewslettersView />,
			loader: allNewslettersLoader,
			shouldRevalidate: ({ currentUrl, nextUrl, defaultShouldRevalidate }) => {
				const clientFiltersChanged = clientFilterParams.some(
					(param) =>
						JSON.stringify(currentUrl.searchParams.getAll(param)) !==
						JSON.stringify(nextUrl.searchParams.getAll(param)),
				);
				const onlyClientFiltersChanged =
					clientFiltersChanged &&
					withoutClientFilterParams(currentUrl) ===
						withoutClientFilterParams(nextUrl);
				return onlyClientFiltersChanged ? false : defaultShouldRevalidate;
			},
		},
	],
};
