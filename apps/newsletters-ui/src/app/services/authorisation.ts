import type { UserPermissions } from '@newsletters-nx/newsletters-data-client';

export const shouldShowEditOptions = (
	permissions: UserPermissions | undefined,
) => {
	if (!permissions) {
		return null;
	}
	return permissions.editEverything;
};
