import type { UserProfile } from './user-profile';

export enum UserAccessLevel {
	Developer,
	Editor,
	Drafter,
	Viewer,
}

export type UserPermissions = {
	editNewsletters: boolean;
	launchNewsletters: boolean;
	writeToDrafts: boolean;
};

const STATIC_USERS = {
	'david.blatcher@guardian.co.uk': UserAccessLevel.Viewer,
};

/**
 * Placeholder function usering static user data. Async to
 * simulate a call to the google groups API (or similar)
 */
export const getUserAccessLevel = async (
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
	return {
		editNewsletters: [
			UserAccessLevel.Developer,
			UserAccessLevel.Editor,
		].includes(accessLevel),
		launchNewsletters: [
			UserAccessLevel.Developer,
			UserAccessLevel.Editor,
		].includes(accessLevel),
		writeToDrafts: [
			UserAccessLevel.Developer,
			UserAccessLevel.Editor,
			UserAccessLevel.Drafter,
		].includes(accessLevel),
	};
};
