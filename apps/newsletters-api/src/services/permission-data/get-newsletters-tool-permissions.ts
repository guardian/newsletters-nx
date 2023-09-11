import type { UserPermissions } from '@newsletters-nx/newsletters-data-client';
import { newslettersToolPermissionNames } from '@newsletters-nx/newsletters-data-client';
import { STAGE } from './aws-params';
import { buildS3 } from './build-client';
import { localPermissions } from './local-test-permissions';
import type { Permission } from './types';

const getAllLocalPermissions = (): Promise<Permission[]> => {
	const allPermissions = localPermissions;
	return Promise.resolve([...allPermissions]);
};

const getAllPermissions = async (): Promise<Permission[]> => {
	if (STAGE !== 'CODE' && STAGE !== 'PROD') {
		return getAllLocalPermissions();
	}

	const S3 = buildS3();

	const { Body } = await S3.getObject({
		Bucket: 'permissions-cache',
		Key: `${STAGE}/permissions.json`,
	});

	if (!Body) {
		throw Error('could not read permissions');
	}

	const bodyString = await Body.transformToString();

	try {
		const allPermissions = JSON.parse(bodyString) as Permission[];
		return allPermissions;
	} catch (e) {
		console.warn(e);
		throw Error('could not parse permissions');
	}
};

export const getUserPermissionsFromPermissionsData = async (
	userEmail: string,
): Promise<UserPermissions> => {
	const permissions = await getAllPermissions();

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
