import { isUsingLocalUserPermissions } from '../../apiDeploymentSettings';
import type { PermissionsService } from './abstract-class';
import { LocalPermissionService } from './LocalPermissions';
import { ParamPermissionService } from './ParamPermissions';

const permissionService: PermissionsService = isUsingLocalUserPermissions()
	? new LocalPermissionService()
	: new ParamPermissionService();

export { permissionService };
