import { denyAll } from '@newsletters-nx/newsletters-data-client';
import type * as LocalPermissionsModule from './LocalPermissions';

const originalEnv = process.env;

const localPermissionService = () => {
	const { LocalPermissionService } =
		jest.requireActual<typeof LocalPermissionsModule>('./LocalPermissions');
	return new LocalPermissionService();
};

beforeEach(() => {
	jest.resetModules();
	process.env = { ...originalEnv, USE_LOCAL_USER_PERMISSIONS: 'true' };
	jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
	process.env = originalEnv;
	jest.restoreAllMocks();
});

describe('LocalPermissionService', () => {
	it("uses each user's explicit permissions and denies unlisted users", async () => {
		process.env.USER_PERMISSIONS = JSON.stringify({
			't800@example.com': { editEverything: true, useJsonEditor: false },
			'john.connor@example.com': { editEverything: false, useJsonEditor: true },
		});
		const service = localPermissionService();

		await expect(service.get({ email: 't800@example.com' })).resolves.toEqual({
			editEverything: true,
			useJsonEditor: false,
		});
		await expect(
			service.get({ email: 'john.connor@example.com' }),
		).resolves.toEqual({
			editEverything: false,
			useJsonEditor: true,
		});
		await expect(
			service.get({ email: 'unknown@example.com' }),
		).resolves.toEqual(denyAll());
		await expect(service.get({ email: 'toString' })).resolves.toEqual(
			denyAll(),
		);
		await expect(service.get()).resolves.toEqual(denyAll());
	});

	it('rejects invalid entries without discarding valid users', async () => {
		process.env.USER_PERMISSIONS = JSON.stringify({
			'valid@example.com': { editEverything: true, useJsonEditor: true },
			'old@example.com': 0,
			'partial@example.com': { editEverything: true },
			'wrong-type@example.com': { editEverything: 'true', useJsonEditor: true },
			'typo@example.com': {
				editEverything: true,
				useJsonEditor: true,
				edit_everything: true,
			},
		});
		const service = localPermissionService();

		await expect(service.get({ email: 'valid@example.com' })).resolves.toEqual({
			editEverything: true,
			useJsonEditor: true,
		});
		for (const email of [
			'old@example.com',
			'partial@example.com',
			'wrong-type@example.com',
			'typo@example.com',
		]) {
			await expect(service.get({ email })).resolves.toEqual(denyAll());
		}
		expect(console.log).toHaveBeenCalledTimes(4);
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining('Invalid USER_PERMISSIONS entry'),
		);
	});

	it.each(['{', 'null', '[]', '"not an object"'])(
		'warns and denies access for invalid configuration %s',
		async (value) => {
			process.env.USER_PERMISSIONS = value;
			const service = localPermissionService();
			await expect(service.get({ email: 'user@example.com' })).resolves.toEqual(
				denyAll(),
			);
			expect(console.log).toHaveBeenCalled();
		},
	);

	it('warns and denies access when local permissions are not configured', async () => {
		delete process.env.USER_PERMISSIONS;
		const service = localPermissionService();
		await expect(service.get({ email: 'user@example.com' })).resolves.toEqual(
			denyAll(),
		);
		expect(console.log).toHaveBeenCalled();
	});
});
