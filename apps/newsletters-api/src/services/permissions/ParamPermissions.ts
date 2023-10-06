import type { UserProfile } from '@newsletters-nx/newsletters-data-client';
import {
	levelToPermissions,
	permissionsDataSchema,
	UserAccessLevel,
} from '@newsletters-nx/newsletters-data-client';
import { getConfigValue } from '@newsletters-nx/util';
import type { PermissionsService } from './abstract-class';

/** 15 minutes*/
const TIME_BETWEEN_PERMISSIONS_PARAM_CHECKS = 1000 * 60 * 15;

const getPermissionsData = async (): Promise<
	Partial<Record<string, UserAccessLevel>>
> => {
	try {
		const value = await getConfigValue('userPermissions', {
			maxAge: TIME_BETWEEN_PERMISSIONS_PARAM_CHECKS,
		});
		return permissionsDataSchema.parse(JSON.parse(value)) as Record<
			string,
			UserAccessLevel
		>;
	} catch (error) {
		console.warn('getPermissionsData failed');
		console.warn(error);
		return {};
	}
};

const defaultPermission = () => levelToPermissions(UserAccessLevel.Viewer);

export class ParamPermissionService implements PermissionsService {
	async get(user?: UserProfile) {
		const email = user?.email;
		if (!email) {
			return defaultPermission();
		}

		const data = await getPermissionsData();

		const accessLevel = data[email];
		if (typeof accessLevel === 'undefined') {
			return defaultPermission();
		}

		return levelToPermissions(accessLevel);
	}
}
