import type {
	UserPermissions,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import {
	levelToPermissions,
	UserAccessLevel,
} from '@newsletters-nx/newsletters-data-client';

const STATIC_USERS = {
	'david.blatcher@guardian.co.uk': UserAccessLevel.Viewer,
};

/**
 * Placeholder function usering static user data. Async to
 * simulate a call to the google groups API (or similar)
 */
const getUserAccessLevel = async (
	user?: UserProfile,
): Promise<UserAccessLevel> => {
	const userList: Partial<Record<string, UserAccessLevel>> =
		await Promise.resolve(STATIC_USERS);

	return user?.email
		? userList[user.email] ?? UserAccessLevel.Viewer
		: UserAccessLevel.Viewer;
};

export const getPermissions = async (
	user?: UserProfile,
): Promise<UserPermissions> => {
	const accessLevel = await getUserAccessLevel(user);
	return levelToPermissions(accessLevel);
};
