import type { NewsletterToolPermission } from '@newsletters-nx/newsletters-data-client';
import {
	denyAll,
	type UserPermissions,
} from '@newsletters-nx/newsletters-data-client';
import * as z from 'zod';

/**
 * 'Guardian' permissions for the newsletters-tool
 *
 * Lists the permissions set up for this tool in https://github.com/guardian/permissions
 *
 * This should exactly match the ids listed under NewslettersTool in https://permissions.gutools.co.uk/definitions
 */
export const GuardianPermissionSchema = z.literal([
	'newsletters_tool_edit_everything',
	'newsletters_tool_edit_json',
]);

export type GuardianPermission = z.infer<typeof GuardianPermissionSchema>;

export const isGuardianNewsletterPermission = (
	perm: unknown,
): perm is GuardianPermission => {
	return z.validate(GuardianPermissionSchema, perm);
};

/**
 *
 * Maps 'Guardian' permissions to 'Newsletter' permissions.
 *
 * The names of permissions set up in the permissions app do not necessarily align with
 * the names setup in the newsletters tool, this maps between them.
 *
 * It should be a 1:1 mapping.
 *
 */
export const toNewsletterToolPermission = (
	gPerm: GuardianPermission,
): NewsletterToolPermission => {
	const mapping: Record<GuardianPermission, NewsletterToolPermission> = {
		newsletters_tool_edit_everything: 'editEverything',
		newsletters_tool_edit_json: 'useJsonEditor',
	};

	return mapping[gPerm];
};

/**
 *
 * Maps a list of granted 'guardian' permissions to UserPermissions object
 *
 */
export const toUserPermissions = (granted: string[]): UserPermissions => {
	const knownPermissions = granted.filter(isGuardianNewsletterPermission);
	const userPermissions = knownPermissions.map(toNewsletterToolPermission);

	const base = denyAll();
	const activePermissions = Object.fromEntries(
		userPermissions.map((perm) => [perm, true]),
	);

	return {
		...base,
		...activePermissions,
	};
};
