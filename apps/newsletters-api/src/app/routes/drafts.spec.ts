import type { Express, Request, Response } from 'express';
import { isPublicReadOnlyApi } from '../../apiDeploymentSettings';
import { draftStore } from '../../services/storage';
import { registerDraftsRoutes } from './drafts';

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

/** Captures the handlers registered on a fake Express app so they can be invoked directly, without booting a real server. */
const makeFakeApp = () => {
	const handlers = new Map<string, (req: Request, res: Response) => unknown>();
	const app = {
		get: (path: string, handler: (req: Request, res: Response) => unknown) => {
			handlers.set(`GET ${path}`, handler);
		},
		delete: (
			path: string,
			handler: (req: Request, res: Response) => unknown,
		) => {
			handlers.set(`DELETE ${path}`, handler);
		},
	} as unknown as Express;
	return {
		app,
		get: (path: string) => handlers.get(`GET ${path}`),
	};
};

const makeMockResponse = () => {
	const send = jest.fn<Response, [unknown]>().mockReturnThis();
	const status = jest.fn<Response, [number]>().mockReturnThis();
	const res = { status, send } as unknown as Response;
	return { res, send };
};

describe('registerDraftsRoutes meta visibility', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('strips meta from /api/drafts on the public read-only deployment', async () => {
		mockIsPublicReadOnlyApi.mockReturnValue(true);
		mockReadAll.mockResolvedValue({ ok: true, data: [DRAFT_WITH_META] });
		const { app, get } = makeFakeApp();
		registerDraftsRoutes(app);
		const { res, send } = makeMockResponse();

		await get('/api/drafts')?.({} as unknown as Request, res);

		const body = send.mock.calls[0]?.[0] as { data: Array<{ meta?: unknown }> };
		expect(body.data[0]?.meta).toBeUndefined();
	});

	it('keeps meta on /api/drafts for the internal read/write deployment', async () => {
		mockIsPublicReadOnlyApi.mockReturnValue(false);
		mockReadAll.mockResolvedValue({ ok: true, data: [DRAFT_WITH_META] });
		const { app, get } = makeFakeApp();
		registerDraftsRoutes(app);
		const { res, send } = makeMockResponse();

		await get('/api/drafts')?.({} as unknown as Request, res);

		const body = send.mock.calls[0]?.[0] as { data: Array<{ meta?: unknown }> };
		expect(body.data[0]?.meta).toEqual(DRAFT_WITH_META.meta);
	});

	it('strips meta from /api/drafts/:listId on the public read-only deployment', async () => {
		mockIsPublicReadOnlyApi.mockReturnValue(true);
		mockRead.mockResolvedValue({ ok: true, data: DRAFT_WITH_META });
		const { app, get } = makeFakeApp();
		registerDraftsRoutes(app);
		const { res, send } = makeMockResponse();

		await get('/api/drafts/:listId')?.(
			{ params: { listId: '1' } } as unknown as Request,
			res,
		);

		const body = send.mock.calls[0]?.[0] as { data: { meta?: unknown } };
		expect(body.data.meta).toBeUndefined();
	});
});
