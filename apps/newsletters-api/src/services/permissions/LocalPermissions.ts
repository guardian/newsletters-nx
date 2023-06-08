import type {UserProfile} from '@newsletters-nx/newsletters-data-client';
import {levelToPermissions, UserAccessLevel,} from '@newsletters-nx/newsletters-data-client';
import {getLocalUserProfiles} from '../../apiDeploymentSettings';
import type {PermissionsService} from './abstract-class';

const localUsers = getLocalUserProfiles();


/**
 * Placeholder function using static user data. Async to
 * simulate a call to the Google Groups API (or similar)
 */
const getUserAccessLevel = async (
	user?: UserProfile,
): Promise<UserAccessLevel> => {
	const userList: Partial<Record<string, UserAccessLevel>> =
		await Promise.resolve(localUsers);

	return user?.email
		? userList[user.email] ?? UserAccessLevel.Viewer
		: UserAccessLevel.Viewer
};

export class LocalPermissionService implements PermissionsService {
	get = async (user?: UserProfile) => {
		const accessLevel = await getUserAccessLevel(user);
		return levelToPermissions(accessLevel);
	};
}
