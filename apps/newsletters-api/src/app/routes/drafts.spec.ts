import { isPublicReadOnlyApi } from '../../apiDeploymentSettings';
import { draftStore } from '../../services/storage';
import { registerDraftsRoutes } from './drafts';
import { invokeGetRoute } from './test-helpers';

jest.mock('../../apiDeploymentSettings', () => ({
	// eslint-disable-next-line @typescript-eslint/consistent-type-imports -- inline import() type needed for jest.requireActual's generic
	...jest.requireActual<typeof import('../../apiDeploymentSettings')>(
		'../../apiDeploymentSettings',
	),
	isPublicReadOnlyApi: jest.fn(() => false),
}));

jest.mock('../../services/storage', () => ({
	draftStore: {
		readAll: jest.fn(),
		read: jest.fn(),
	},
}));

jest.mock('../../services/permissions', () => ({
	permissionService: { get: jest.fn() },
}));

const mockIsPublicReadOnlyApi = isPublicReadOnlyApi as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method -- these are jest.fn() mocks, not real methods with a `this`
const mockReadAll = draftStore.readAll as jest.Mock;
// eslint-disable-next-line @typescript-eslint/unbound-method -- these are jest.fn() mocks, not real methods with a `this`
const mockRead = draftStore.read as jest.Mock;

const DRAFT_WITH_META = {
	listId: 1,
	name: 'a-draft',
	meta: { createdBy: 'editor@example.com', createdTimestamp: 1 },
};

describe('registerDraftsRoutes meta visibility', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it.each([
		{
			description: 'strips meta from /api/drafts on the public read-only deployment',
			isPublic: true,
			expectedMeta: undefined,
		},
		{
			description:
				'keeps meta on /api/drafts for the internal read/write deployment',
			isPublic: false,
			expectedMeta: DRAFT_WITH_META.meta,
		},
	])('$description', async ({ isPublic, expectedMeta }) => {
		mockIsPublicReadOnlyApi.mockReturnValue(isPublic);
		mockReadAll.mockResolvedValue({ ok: true, data: [DRAFT_WITH_META] });

		const body = await invokeGetRoute<{ data: Array<{ meta?: unknown }> }>(
			registerDraftsRoutes,
			'/api/drafts',
		);

		expect(body.data[0]?.meta).toEqual(expectedMeta);
	});

	it('strips meta from /api/drafts/:listId on the public read-only deployment', async () => {
		mockIsPublicReadOnlyApi.mockReturnValue(true);
		mockRead.mockResolvedValue({ ok: true, data: DRAFT_WITH_META });

		const body = await invokeGetRoute<{ data: { meta?: unknown } }>(
			registerDraftsRoutes,
			'/api/drafts/:listId',
			{ params: { listId: '1' } },
		);

		expect(body.data.meta).toBeUndefined();
	});
});
