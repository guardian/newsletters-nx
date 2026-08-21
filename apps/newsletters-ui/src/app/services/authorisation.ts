import type { UserPermissions } from '@newsletters-nx/newsletters-data-client';

export const shouldShowEditOptions = (
	permissions: UserPermissions | undefined,
) => {
	if (!permissions) {
		return null;
	}
	const { editTags, editNewsletters, editSignUpPage, editBraze } = permissions;
	return [editTags, editNewsletters, editSignUpPage, editBraze].some(
		(permission) => permission,
	);
};
