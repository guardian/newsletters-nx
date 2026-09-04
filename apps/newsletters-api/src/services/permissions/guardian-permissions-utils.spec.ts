import {
	denyAll,
	NewsletterToolPermissionSchema,
	type UserPermissions,
} from '@newsletters-nx/newsletters-data-client';
import type { GuardianPermission } from './guardian-permissions-utils';
import {
	GuardianPermissionSchema,
	toNewsletterToolPermission,
	toUserPermissions,
} from './guardian-permissions-utils';

describe('toUserPermission()', () => {
	const mappings: Array<[GuardianPermission, keyof UserPermissions]> = [
		['newsletters_tool_edit_everything', 'editEverything'],
		['newsletters_tool_edit_json', 'useJsonEditor'],
	];

	it.each(mappings)('maps %s to %s', (gPerm, uPerm) => {
		expect(toNewsletterToolPermission(gPerm)).toBe(uPerm);
	});

	it('maps every GuardianPermission to a NewsletterPermission, and vice-versa', () => {
		const allUserPermissions = new Set(NewsletterToolPermissionSchema.values);

		const foundUserPermissions = new Set();
		GuardianPermissionSchema.values.forEach((gPerm) => {
			foundUserPermissions.add(toNewsletterToolPermission(gPerm));
		});

		expect(foundUserPermissions).toEqual(allUserPermissions);
	});
});

describe('toUserPermissions()', () => {
	it('Denies all permissions if permission list empty', () => {
		const expected: UserPermissions = denyAll();
		expect(toUserPermissions([])).toEqual(expected);
	});

	it('maps all supported GuardianPermission to a NewsletterPermission', () => {
		const allGuardianPermissions = Array.from(GuardianPermissionSchema.values);
		const expected: UserPermissions = {
			editEverything: true,
			useJsonEditor: true,
		};

		expect(toUserPermissions(allGuardianPermissions)).toEqual(expected);
	});

	it('ignores unknown permission ids from permissions tool', () => {
		const permissions: string[] = [
			'not_a_real_permission',
			'newsletters_tool_edit_everything',
			'also_not_real',
		];

		const expected: UserPermissions = {
			editEverything: true,
			useJsonEditor: false,
		};

		expect(toUserPermissions(permissions)).toEqual(expected);
	});
});
