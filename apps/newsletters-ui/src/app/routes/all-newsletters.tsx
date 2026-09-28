import type { RouteObject } from 'react-router-dom';
import {
	allNewslettersSearchParam,
	AllNewslettersView,
} from '../components/views/AllNewslettersView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { allNewslettersLoader } from '../loaders/all-newsletters';

const withoutSearchParam = (url: URL): string => {
	const params = new URLSearchParams(url.search);
	params.delete(allNewslettersSearchParam);
	return `${url.pathname}?${params.toString()}`;
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
				const onlySearchChanged =
					currentUrl.searchParams.get(allNewslettersSearchParam) !==
						nextUrl.searchParams.get(allNewslettersSearchParam) &&
					withoutSearchParam(currentUrl) === withoutSearchParam(nextUrl);
				return onlySearchChanged ? false : defaultShouldRevalidate;
			},
		},
	],
};
