import type { S3 } from '@aws-sdk/client-s3';
import { STAGE } from './aws-params';
import { buildS3 } from './build-client';

interface Override {
	userId: string;
	active: boolean;
}

interface Permission {
	permission: {
		name: string;
		app: string;
	};
	overrides: Override[];
}

// borrowed from https://github.com/guardian/pinboard/blob/main/shared/permissions.ts#L17
const getPinboardPermissionOverrides = (S3: S3) =>
	S3.getObject({
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

export const userHasPinboardPermission = (
	userEmail: string,
): Promise<boolean> => {
	const s3 = buildS3();

	return getPinboardPermissionOverrides(s3).then(
		(overrides) =>
			!!overrides?.find(({ userId, active }) => userId === userEmail && active),
	);
};

export const getAllPinboardPermissionsData = () => {
	const s3 = buildS3();
	return getPinboardPermissionOverrides(s3);
};
