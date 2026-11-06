import type { Express } from 'express';
import { registerDraftsRoutes, registerDraftsWriteRoutes } from './drafts';

jest.mock('../../services/storage', () => ({ draftStore: {} }));
jest.mock('../../services/permissions', () => ({
	permissionService: { get: jest.fn() },
}));

function makeFakeApp() {
	const get = jest.fn();
	const del = jest.fn();
	const app = { get, delete: del } as unknown as Express;
	return { app, get, del };
}

describe('drafts route registration', () => {
	it('registers no delete route in the read routes, which the read-only API serves', () => {
		const { app, get, del } = makeFakeApp();
		registerDraftsRoutes(app);
		expect(get).toHaveBeenCalledTimes(2);
		expect(del).not.toHaveBeenCalled();
	});

	it('registers the delete route in the write routes', () => {
		const { app, get, del } = makeFakeApp();
		registerDraftsWriteRoutes(app);
		expect(del).toHaveBeenCalledWith('/api/drafts/:listId', expect.anything());
		expect(get).not.toHaveBeenCalled();
	});
});
