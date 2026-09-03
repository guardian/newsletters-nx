import {
	NewsletterToolPermissionSchema,
	type UserPermissions,
} from '@newsletters-nx/newsletters-data-client';
import type { GuardianPermission } from './utils';
import {
	GuardianPermissionSchema,
	toNewsletterToolPermission,
	toUserPermissions,
} from './utils';

describe('toUserPermission()', () => {
	const mappings: Array<[GuardianPermission, keyof UserPermissions]> = [
		['newsletters_tool_edit_everything', 'editEverything'],
		['newsletters_tool_use_json_editor', 'useJsonEditor'],
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
	it('Supports empty permissions list', () => {
		const expected: UserPermissions = {
			editEverything: false,
			useJsonEditor: false,
		};
		expect(toUserPermissions([])).toEqual(expected);
	});

	it('maps all permissions', () => {
		const allGuardianPermissions = Array.from(GuardianPermissionSchema.values);
		const expected: UserPermissions = {
			editEverything: true,
			useJsonEditor: true,
		};

		expect(toUserPermissions(allGuardianPermissions)).toEqual(expected);
	});

	it('ignores unknown guardian permissions', () => {
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
