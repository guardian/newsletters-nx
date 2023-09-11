import type { UserPermissions } from '@newsletters-nx/newsletters-data-client';
import { newslettersToolPermissionNames } from '@newsletters-nx/newsletters-data-client';
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

	const positives = newslettersToolPermissionNames.filter((permissionName) =>
		toolPermissionsTheUserHas.some(
			(permission) => permission.permission.name == permissionName,
		),
	);

	const userPermissions: UserPermissions = {
		editNewsletters: false,
		useJsonEditor: false,
		launchNewsletters: false,
		writeToDrafts: false,
		viewMetaData: false,
		editBraze: false,
		editOphan: false,
		editTags: false,
		editSignUpPage: false,
	};

	positives.forEach((key) => {
		userPermissions[key] = true;
	});

	return userPermissions;
};
