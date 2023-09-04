import { STAGE } from './aws-params';
import { buildS3 } from './build-client';
import { localPermissions } from './local-test-permissions';
import type { Override, Permission } from './types';

const useLocalPinboardPermissions = (): Promise<Override[] | undefined> => {
	const allPermissions = localPermissions;

	const overrides = allPermissions.find(
		({ permission }) =>
			permission.app === 'pinboard' && permission.name === 'pinboard',
	)?.overrides;

	return Promise.resolve(overrides);
};

// borrowed from https://github.com/guardian/pinboard/blob/main/shared/permissions.ts#L17
const getPinboardPermissionOverrides = () => {
	if (STAGE !== 'CODE' && STAGE !== 'PROD') {
		return useLocalPinboardPermissions();
	}

	const S3 = buildS3();

	return S3.getObject({
		Bucket: 'permissions-cache',
		Key: `${STAGE}/permissions.json`,
	})
		.then(({ Body }) => {
			if (!Body) {
				throw Error('could not read permissions');
			}
			return Body.transformToString();
		})
		.then((Body) => {
			const allPermissions = JSON.parse(Body) as Permission[];

			return allPermissions.find(
				({ permission }) =>
					// see https://github.com/guardian/permissions/pull/128
					permission.app === 'pinboard' && permission.name === 'pinboard',
			)?.overrides;
		});
};

export const userHasPinboardPermission = (
	userEmail: string,
): Promise<boolean> => {
	return getPinboardPermissionOverrides().then(
		(overrides) =>
			!!overrides?.find(({ userId, active }) => userId === userEmail && active),
	);
};

export const getAllPinboardPermissionsData = () => {
	return getPinboardPermissionOverrides();
};
