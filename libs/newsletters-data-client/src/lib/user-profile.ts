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

export const UserPermissionsSchema = z.object({
	editEverything: z.boolean(), // Can Edit everything (except JSON)
	useJsonEditor: z.boolean(), // Can Edit JSON using the JSON editor
});
export type UserPermissions = z.infer<typeof UserPermissionsSchema>;

// Schema for the names of individual permissions, e.g 'useJsonEditor'
export const NewsletterToolPermissionSchema = z.toZod<keyof UserPermissions>()(
	z.literal(['editEverything', 'useJsonEditor']),
);
export type NewsletterToolPermission = z.infer<
	typeof NewsletterToolPermissionSchema
>;

/**
 *
 * Provides no permissions to user. (@guardian.co.uk logins can still view the tool)
 *
 */
export const denyAll = (): UserPermissions => ({
	editEverything: false,
	useJsonEditor: false,
});

/**
 *
 * Provides all permissions to user.
 *
 * Use with caution
 *
 */
export const grantAll = (): UserPermissions => ({
	editEverything: true,
	useJsonEditor: true,
});
