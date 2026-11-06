import { z } from 'zod';

/**
 * The fields expected in user data obtained by the Ec2
 * load balancer when authenticating user via Google auth,
 * based on the scopes requested in ''Google Auth' action
 * defined the cdk config.
 */
export const UserProfileSchema = z
	.object({
		/** the unique user id used by the auth provider (in our case, google) */
		sub: z.string(),
		name: z.string(),
		given_name: z.string(),
		family_name: z.string(),
		/** the url to the profile picture for the user.
		 * Google provides the url to a generic icon if no profile pic is set */
		picture: z.string(),
		/** the user's email address */
		email: z.string(),
		email_verified: z.boolean(),
		locale: z.string(),
		hd: z.string(),
		/** the expiry timestamp of the token used to obtain the profile data */
		exp: z.number(),
		/** the issuer of the profile data - should be https://accounts.google.com */
		iss: z.string(),
	})
	.partial();
export type UserProfile = z.infer<typeof UserProfileSchema>;

export enum UserAccessLevel {
	Developer = 0, // Can do everything
	Editor = 1, // Can edit and launch newsletters
	// Drafter = 2, // Intentionally removed.
	Viewer = 3, // Read-only access
}

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

export const permissionsDataSchema = z.record(z.string(), z.int().min(0));

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

export const levelToPermissions = (
	accessLevel: UserAccessLevel,
): UserPermissions => {
	return {
		editEverything: [
			UserAccessLevel.Developer,
			UserAccessLevel.Editor,
		].includes(accessLevel),
		useJsonEditor: [UserAccessLevel.Developer].includes(accessLevel),
	};
};
