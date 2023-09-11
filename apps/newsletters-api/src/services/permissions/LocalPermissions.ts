import type { UserProfile } from '@newsletters-nx/newsletters-data-client';
import { EMPTY_USER_PERMISSIONS } from '@newsletters-nx/newsletters-data-client';
import { getLocalUserPermissions } from '../../apiDeploymentSettings';
import type { PermissionsService } from './abstract-class';
import { permissionsToUserPermissions } from './permissions-to-user-permissions';

export class LocalPermissionService implements PermissionsService {
	get = async (user?: UserProfile) => {
		if (!user?.email) {
			return { ...EMPTY_USER_PERMISSIONS };
		}

		const permissions = getLocalUserPermissions();

		const userPermissions = permissionsToUserPermissions(
			user.email,
			permissions,
		);

		return Promise.resolve(userPermissions);
	};
}
