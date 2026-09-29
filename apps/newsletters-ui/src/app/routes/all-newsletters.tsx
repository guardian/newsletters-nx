import type { RouteObject } from 'react-router-dom';
import {
	allNewslettersCategoryParam,
	allNewslettersSearchParam,
	AllNewslettersView,
} from '../components/views/AllNewslettersView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { allNewslettersLoader } from '../loaders/all-newsletters';

const withoutClientFilterParams = (url: URL): string => {
	const params = new URLSearchParams(url.search);
	params.delete(allNewslettersSearchParam);
	params.delete(allNewslettersCategoryParam);
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
				const clientFiltersChanged =
					currentUrl.searchParams.get(allNewslettersSearchParam) !==
						nextUrl.searchParams.get(allNewslettersSearchParam) ||
					JSON.stringify(
						currentUrl.searchParams.getAll(allNewslettersCategoryParam),
					) !==
						JSON.stringify(
							nextUrl.searchParams.getAll(allNewslettersCategoryParam),
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
