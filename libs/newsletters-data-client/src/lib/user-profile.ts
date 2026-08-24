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
	Developer, // Can do everything
	Editor, // Can edit and launch newsletters
	Viewer, // Read-only access
}

export type UserPermissions = {
	editNewsletters: boolean;
	useJsonEditor: boolean;
};

export const permissionsDataSchema = z.record(z.string(), z.int().min(0));

export const levelToPermissions = (
	accessLevel: UserAccessLevel,
): UserPermissions => {
	return {
		editNewsletters: [
			UserAccessLevel.Developer,
			UserAccessLevel.Editor,
		].includes(accessLevel),
		useJsonEditor: [UserAccessLevel.Developer].includes(accessLevel),
	};
};
