import {
	isUsingGuardianPermissions,
	isUsingLocalUserPermissions,
} from '../../apiDeploymentSettings';
import type { PermissionsService } from './abstract-class';
import { GuardianPermissionService } from './GuardianPermissions';
import { LocalPermissionService } from './LocalPermissions';
import { ParamPermissionService } from './ParamPermissions';

const getPermissionService = (): PermissionsService => {
	if (isUsingLocalUserPermissions()) {
		return new LocalPermissionService();
	}

	if (isUsingGuardianPermissions()) {
		return new GuardianPermissionService();
	}

	return new ParamPermissionService();
};

const permissionService: PermissionsService = getPermissionService();

export { permissionService };
