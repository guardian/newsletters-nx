import { z } from 'zod';

/**
 * The fields expected in user data obtained by the Ec2
 * load balancer when authenticating user via Google auth,
 * based on the scopes requested in ''Google Auth' action
 * defined the cdk config.
 */
export type UserProfile = Partial<{
	/** the unique user id used by the auth provider (in our case, google) */
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	/** the url to the profile picture for the user.
	 * Google provides the url to a generic icon if no profile pic is set */
	picture: string;
	/** the user's email address */
	email: string;
	email_verified: boolean;
	locale: string;
	hd: string;
	/** the expiry timestamp of the token used to obtain the profile data */
	exp: number;
	/** the issuer of the profile data - should be https://accounts.google.com */
	iss: string;
}>;

export enum UserAccessLevel {
	Developer,
	Editor,
	Drafter,
	Viewer,
	CentralProduction,
	BrazeEditor,
	OphanEditor,
}

export type UserPermissions = {
	editNewsletters: boolean;
	useJsonEditor: boolean;
	launchNewsletters: boolean;
	writeToDrafts: boolean;
	viewMetaData: boolean;
	editBraze: boolean;
	editOphan: boolean;
	editTags: boolean;
	editSignUpPage: boolean;
};

export const permissionsDataSchema = z.record(
	z.string(),
	z
		.number()
		.int()
		.refine((arg) => arg >= 0 && arg <= 6),
);

export const levelToPermissions = (
	accessLevel: UserAccessLevel,
): UserPermissions => {
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
			UserAccessLevel.CentralProduction,
			UserAccessLevel.BrazeEditor,
			UserAccessLevel.OphanEditor,
		].includes(accessLevel),
		viewMetaData: [UserAccessLevel.Developer].includes(accessLevel),
		useJsonEditor: [UserAccessLevel.Developer].includes(accessLevel),
		editBraze: [UserAccessLevel.BrazeEditor].includes(accessLevel),
		editOphan: [UserAccessLevel.OphanEditor].includes(accessLevel),
		editTags: [UserAccessLevel.CentralProduction].includes(accessLevel),
		editSignUpPage: [UserAccessLevel.CentralProduction].includes(accessLevel),
	};
};
