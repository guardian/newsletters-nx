import type { UserProfile } from './user-profile';

export enum UserAccessLevel {
	Developer,
	Editor,
	Drafter,
	Viewer,
}

type Permissions = {
	editNewsletters: boolean;
};

const STATIC_USERS: Partial<Record<string, UserAccessLevel>> = {
	'david.blatcher@guardian.co.uk': UserAccessLevel.Viewer,
};

export const getUserAccessLevel = (user?: UserProfile): UserAccessLevel => {
	return user?.email
		? STATIC_USERS[user.email] ?? UserAccessLevel.Viewer
		: UserAccessLevel.Viewer;
};

export const getPermissions = (user?: UserProfile): Permissions => {
	const accessLevel = getUserAccessLevel(user);
	return {
		editNewsletters: [
			UserAccessLevel.Developer,
			UserAccessLevel.Editor,
		].includes(accessLevel),
	};
};
