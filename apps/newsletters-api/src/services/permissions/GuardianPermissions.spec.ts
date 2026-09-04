import { init as originalInit } from '@guardian/permissions-client';
import type { UserPermissions } from '@newsletters-nx/newsletters-data-client';
import * as utils from './guardian-permissions-utils';
import { GuardianPermissionService } from './GuardianPermissions';

const init = originalInit as jest.Mock;

// Will be hoisted above imports by Jest
/* eslint-disable @typescript-eslint/consistent-type-imports -- We want the type of this module for our mock */
jest.mock<typeof import('@guardian/permissions-client')>(
	'@guardian/permissions-client',
	() => {
		return {
			init: jest.fn(),
		};
	},
);
/* eslint-enable @typescript-eslint/consistent-type-imports */

describe('GuardianPermissionsService', () => {
	beforeEach(() => {
		// Avoid muddying the test output
		jest.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('get() passes the user email to permissionsClient.listUserPermissions()', async () => {
		const spy = jest.fn(() => []);
		init.mockImplementation(() => ({
			listUserPermissions: spy,
		}));

		const service = new GuardianPermissionService();
		await service.get({
			email: 'ada.lovelace@guardian.co.uk',
		});

		expect(spy).toHaveBeenCalledWith('ada.lovelace@guardian.co.uk');
	});

	it('denies all permissions on error', async () => {
		init.mockImplementation(() => ({
			listUserPermissions: () => {
				throw new Error('Not Implemented');
			},
		}));

		const service = new GuardianPermissionService();
		const permissions = await service.get({
			email: 'ada.lovelace@guardian.co.uk',
		});
		expect(permissions).toEqual({
			editEverything: false,
			useJsonEditor: false,
		} satisfies UserPermissions);
	});

	it("calls toUserPermissions() with all of a user's permissions", async () => {
		init.mockReturnValue({
			listUserPermissions: () => [
				'newsletters_tool_edit_everything',
				'fictional_tool_write_access',
				'another_tool_read_access',
			],
		});

		const spy = jest.spyOn(utils, 'toUserPermissions');

		const service = new GuardianPermissionService();
		await service.get({
			email: 'ada.lovelace@guardian.co.uk',
		});

		expect(spy).toHaveBeenCalledWith([
			'newsletters_tool_edit_everything',
			'fictional_tool_write_access',
			'another_tool_read_access',
		]);
	});

	it('logs a warning on error', async () => {
		init.mockReturnValue({
			listUserPermissions: () => {
				throw new Error('Not Implemented');
			},
		});

		const service = new GuardianPermissionService();
		await service.get({
			email: 'ada.lovelace@guardian.co.uk',
		});

		expect(console.warn).toHaveBeenNthCalledWith(
			1,
			'getPermissionsData("ada.lovelace@guardian.co.uk") failed',
		);
		expect(console.warn).toHaveBeenNthCalledWith(
			2,
			new Error('Not Implemented'),
		);
	});

	describe('initializes @guardian/permissions-client', () => {
		const originalEnv = process.env;

		describe.each([
			['DEV', 'LOCAL', true],
			['CODE', 'CODE', false],
			['PROD', 'PROD', false],
		])(
			'when process.env.STAGE=%s',
			(envStage, clientStage, isRunningLocally) => {
				beforeEach(() => {
					jest.resetModules();
					jest.replaceProperty(process, 'env', {
						...originalEnv,
						STAGE: envStage,
					});
				});

				it(`should use stage ${clientStage}`, () => {
					init.mockReturnValue({
						listUserPermissions: () => {
							return [];
						},
					});

					new GuardianPermissionService();

					expect(init).toHaveBeenCalledWith({
						stage: clientStage,
						isRunningLocally,
					});
				});

				afterEach(() => {
					jest.restoreAllMocks();
				});
			},
		);
	});
});
