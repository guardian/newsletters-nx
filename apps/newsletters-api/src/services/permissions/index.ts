import { isUsingLocalUserPermissions } from '../../apiDeploymentSettings';
import type { PermissionsService } from './abstract-class';
import { GuardianPermissionService } from './GuardianPermissions';
import { LocalPermissionService } from './LocalPermissions';

const getPermissionService = (): PermissionsService => {
	if (isUsingLocalUserPermissions()) {
		return new LocalPermissionService();
	}

	return new GuardianPermissionService();
};

const permissionService: PermissionsService = getPermissionService();

export { permissionService };
