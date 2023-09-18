import type { UserPermissions } from '@newsletters-nx/newsletters-data-client';
import {
	EMPTY_USER_PERMISSIONS,
	newslettersToolPermissionNames,
} from '@newsletters-nx/newsletters-data-client';
import type { Permission } from './types';

export const permissionsToUserPermissions = (
	userEmail: string,
	permissions: Permission[],
): UserPermissions => {
	const toolPermissionsTheUserHas = permissions.filter(
		(permission) =>
			permission.permission.app === 'newsletters-tool' &&
			permission.overrides.some(
				(override) => override.active && override.userId === userEmail,
			),
	);

	const namesForToolPermissionsTheUserHas =
		newslettersToolPermissionNames.filter((permissionName) =>
			toolPermissionsTheUserHas.some(
				(permission) => permission.permission.name == permissionName,
			),
		);

	const userPermissions: UserPermissions = { ...EMPTY_USER_PERMISSIONS };
	namesForToolPermissionsTheUserHas.forEach((key) => {
		userPermissions[key] = true;
	});

	return userPermissions;
};
