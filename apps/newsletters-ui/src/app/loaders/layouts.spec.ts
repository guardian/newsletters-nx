import type {
	Layout,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchApiData } from '../api-requests/fetch-api-data';
import { layoutLoader } from './layouts';

const runLoader = () => {
	return layoutLoader({
		request: new Request('http://localhost/layouts/uk'),
		params: { id: 'uk' },
		context: undefined,
		url: new URL('http://localhost/layouts/uk'),
		pattern: '/layouts/:id',
	});
};

const exampleLayout: Layout = {
	groups: [
		{ title: 'a', newsletters: ['x', 'y'] },
		{ title: 'b', newsletters: ['z'] },
	],
};

const exampleNewsletter: NewsletterData = {
	identityName: 'example',
	name: 'example',
	category: 'article-based',
	theme: 'news',
	status: 'live',
} as NewsletterData;

vi.mock('../api-requests/fetch-api-data', () => ({
	fetchApiData: vi.fn(),
}));

const mockFetchApiData = vi.mocked(fetchApiData);

beforeEach(() => {
	vi.resetAllMocks();
});

const mockApiData = ({
	layout,
	newsletters,
}: {
	layout?: Layout;
	newsletters?: NewsletterData[];
}) => {
	mockFetchApiData.mockImplementation((path: string) => {
		switch (path) {
			case 'api/layouts/uk':
				return Promise.resolve(layout satisfies Layout | undefined);
			case 'api/newsletters':
				return Promise.resolve(
					newsletters satisfies NewsletterData[] | undefined,
				);
			default:
				return Promise.resolve(undefined);
		}
	});
};

describe('layoutsLoaders', () => {
	it('returns undefined if no newsletters data is available', async () => {
		mockApiData({ layout: exampleLayout, newsletters: undefined });
		const loaderData = await runLoader();
		expect(loaderData).toBeUndefined();
	});

	it('returns layouts and newsletters if data is available for both', async () => {
		mockApiData({ layout: exampleLayout, newsletters: [exampleNewsletter] });
		const loaderData = (await runLoader()) as {
			layout: Layout;
			newsletters: NewsletterData[];
		};
		expect(loaderData.layout).toEqual(exampleLayout);
		expect(loaderData.newsletters).toEqual([exampleNewsletter]);
	});

	it('returns undefined layout and newsletters if newsletter data is available, but layout is not', async () => {
		mockApiData({ layout: undefined, newsletters: [exampleNewsletter] });
		const loaderData = (await runLoader()) as {
			layout: Layout;
			newsletters: NewsletterData[];
		};
		expect(loaderData.layout).toEqual(undefined);
		expect(loaderData.newsletters).toEqual([exampleNewsletter]);
	});
});
