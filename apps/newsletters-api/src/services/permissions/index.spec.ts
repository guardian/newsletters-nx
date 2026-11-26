import { isUsingLocalUserPermissions } from '../../apiDeploymentSettings';
import { GuardianPermissionService } from './GuardianPermissions';
import { LocalPermissionService } from './LocalPermissions';
import type * as PermissionsModule from './index';

jest.mock('../../apiDeploymentSettings', () => ({
	isUsingLocalUserPermissions: jest.fn(),
}));
jest.mock('./GuardianPermissions', () => ({
	GuardianPermissionService: jest.fn(),
}));
jest.mock('./LocalPermissions', () => ({
	LocalPermissionService: jest.fn(),
}));

describe('permission service selection', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('uses the permissions app by default', () => {
		jest.mocked(isUsingLocalUserPermissions).mockReturnValue(false);
		jest.isolateModules(() => {
			const { permissionService } =
				jest.requireActual<typeof PermissionsModule>('./index');
			expect(permissionService).toBeInstanceOf(GuardianPermissionService);
		});
		expect(GuardianPermissionService).toHaveBeenCalledTimes(1);
		expect(LocalPermissionService).not.toHaveBeenCalled();
	});

	it('preserves the local development override', () => {
		jest.mocked(isUsingLocalUserPermissions).mockReturnValue(true);
		jest.isolateModules(() => {
			const { permissionService } =
				jest.requireActual<typeof PermissionsModule>('./index');
			expect(permissionService).toBeInstanceOf(LocalPermissionService);
		});
		expect(LocalPermissionService).toHaveBeenCalledTimes(1);
		expect(GuardianPermissionService).not.toHaveBeenCalled();
	});
});
