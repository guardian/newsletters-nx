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

export type UserPermissionName =
	| 'editNewsletters'
	| 'useJsonEditor'
	| 'launchNewsletters'
	| 'writeToDrafts'
	| 'viewMetaData'
	| 'editBraze'
	| 'editOphan'
	| 'editTags'
	| 'editSignUpPage';

export type UserPermissions = Record<UserPermissionName, boolean>;

export const newslettersToolPermissionNames: Readonly<UserPermissionName[]> = [
	'editNewsletters',
	'useJsonEditor',
	'launchNewsletters',
	'writeToDrafts',
	'viewMetaData',
	'editBraze',
	'editOphan',
	'editTags',
	'editSignUpPage',
];

export const EMPTY_USER_PERMISSIONS: Readonly<UserPermissions> = {
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
