import { permissionService } from '../../services/permissions';
import { getUserProfile } from '../get-user-profile';
import { makeErrorResponse, makeSuccessResponse } from '../responses';
import { invokeGetRoute } from './test-helpers';
import { registerUserRoute } from './user';

jest.mock('../get-user-profile', () => ({
	getUserProfile: jest.fn(),
}));
jest.mock('../../services/permissions', () => ({
	permissionService: { get: jest.fn() },
}));

const permissionGetMock = jest.spyOn(permissionService, 'get');

beforeEach(() => {
	jest.clearAllMocks();
});

describe('user routes', () => {
	it('waits for JWT verification before returning the profile', async () => {
		const profile = { sub: 'google-user-id', email: 'editor@guardian.co.uk' };
		jest.mocked(getUserProfile).mockResolvedValue({ profile });

		expect(await invokeGetRoute(registerUserRoute, '/api/user/whoami')).toEqual(
			makeSuccessResponse(profile),
		);
	});

	it('returns an error when JWT verification fails', async () => {
		jest.mocked(getUserProfile).mockResolvedValue({
			profile: undefined,
			errorMessage: 'Failed to verify user profile.',
		});

		expect(await invokeGetRoute(registerUserRoute, '/api/user/whoami')).toEqual(
			makeErrorResponse('Failed to verify user profile.'),
		);
	});

	it('uses the verified profile when looking up permissions', async () => {
		const profile = { sub: 'google-user-id', email: 'editor@guardian.co.uk' };
		const permissions = { editEverything: true, useJsonEditor: false };
		jest.mocked(getUserProfile).mockResolvedValue({ profile });
		permissionGetMock.mockResolvedValue(permissions);

		expect(
			await invokeGetRoute(registerUserRoute, '/api/user/permissions'),
		).toEqual(makeSuccessResponse(permissions));
		expect(permissionGetMock).toHaveBeenCalledWith(profile);
	});

	it('does not pass an unverified profile to the permissions service', async () => {
		const permissions = { editEverything: false, useJsonEditor: false };
		jest.mocked(getUserProfile).mockResolvedValue({
			profile: undefined,
			errorMessage: 'Failed to verify user profile.',
		});
		permissionGetMock.mockResolvedValue(permissions);

		expect(
			await invokeGetRoute(registerUserRoute, '/api/user/permissions'),
		).toEqual(makeSuccessResponse(permissions));
		expect(permissionGetMock).toHaveBeenCalledWith(undefined);
	});
});
