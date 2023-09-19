import type { UserProfile } from '@newsletters-nx/newsletters-data-client';
import {
	levelToPermissions,
	permissionsDataSchema,
	UserAccessLevel,
} from '@newsletters-nx/newsletters-data-client';
import { getConfigValue } from '@newsletters-nx/util';
import type { PermissionsService } from './abstract-class';

const getPermissionsData = async (): Promise<
	Partial<Record<string, UserAccessLevel>>
> => {
	try {
		const value = await getConfigValue('userPermissions', { maxAge: 10000 });
		const json = JSON.parse(value) as unknown;
		return permissionsDataSchema.parse(json) as Record<string, UserAccessLevel>;
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
