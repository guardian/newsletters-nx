import {
	denyAll,
	type UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import { getLocalUserPermissions } from '../../apiDeploymentSettings';
import type { PermissionsService } from './abstract-class';

const localUsers = getLocalUserPermissions();

export class LocalPermissionService implements PermissionsService {
	get = (user?: UserProfile) => {
		const permissions = user?.email ? localUsers.get(user.email) : undefined;
		return Promise.resolve(permissions ?? denyAll());
	};
}
