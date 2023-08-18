import { StorageRequestFailureReason } from '@newsletters-nx/newsletters-data-client';
import type {
	ApiResponse,
	UserPermissions,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import { permissionService } from '../services/permissions';

// TODO - make the error response type generic
export const makeErrorResponse = (message: string): ApiResponse => ({
	ok: false,
	message,
});

export function makeSuccessResponse<T extends object>(data: T): ApiResponse<T> {
	return {
		ok: true,
		total: Array.isArray(data) ? data.length : 1,
		data,
	};
}

export const mapStorageFailureReasonToStatusCode = (
	reason?: StorageRequestFailureReason,
): number => {
	switch (reason) {
		case StorageRequestFailureReason.InvalidDataInput:
			return 400;
		case StorageRequestFailureReason.NotFound:
			return 404;
		case StorageRequestFailureReason.NoCredentials:
			return 403;
		case StorageRequestFailureReason.DataInStoreNotValid:
			return 422;
		default:
			return 500;
	}
};

export const makeAccessDeniedApiResponse = async (
	profile: UserProfile | undefined,
	permission: keyof UserPermissions,
): Promise<ApiResponse | undefined> => {
	if (!profile) {
		return makeErrorResponse(`No user profile.`);
	}
	const permissions = await permissionService.get(profile);

	if (!permissions[permission]) {
		return makeErrorResponse(`User does not have permission to ${permission}`);
	}
	return undefined;
};

export const hasEditAccess = async (
	profile: UserProfile | undefined,
): Promise<boolean> => {
	if (!profile) return false;
	const permissions = await permissionService.get(profile);
	const { editTags, editNewsletters, editSignUpPage, editBraze, editOphan } =
		permissions;
	return !!(
		editOphan ||
		editTags ||
		editNewsletters ||
		editSignUpPage ||
		editBraze
	);
};
