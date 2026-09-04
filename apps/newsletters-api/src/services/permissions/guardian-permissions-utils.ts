import type { NewsletterToolPermission } from '@newsletters-nx/newsletters-data-client';
import {
	denyAll,
	type UserPermissions,
} from '@newsletters-nx/newsletters-data-client';
import * as z from 'zod';

// Must match the identifiers in https://permissions.gutools.co.uk/definitions
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

export const toNewsletterToolPermission = (
	gPerm: GuardianPermission,
): NewsletterToolPermission => {
	const mapping: Record<GuardianPermission, NewsletterToolPermission> = {
		newsletters_tool_edit_everything: 'editEverything',
		newsletters_tool_edit_json: 'useJsonEditor',
	};

	return mapping[gPerm];
};

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
