import type {
	NewsletterData,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import { getUserEditSchema } from '@newsletters-nx/newsletters-data-client';
import { permissionService } from '../services/permissions';

export const hasEditAccess = async (
	profile: UserProfile | undefined,
): Promise<boolean> => {
	if (!profile) return false;
	const permissions = await permissionService.get(profile);
	const { editTags, editNewsletters, editSignUpPage, editBraze, editOphan } =
		permissions;
	return [editTags, editNewsletters, editSignUpPage, editBraze, editOphan].some(
		(permission) => permission,
	);
};

export const isAuthorisedToMakeRequestedNewsletterUpdate = async (
	profile: UserProfile | undefined,
	update: Partial<NewsletterData>,
): Promise<boolean> => {
	if (!profile) return false;
	const permissions = await permissionService.get(profile);
	const { editNewsletters } = permissions;

	if (editNewsletters) return true;

	const updateKeys = Object.keys(update);

	const { shape: userEditSchemaObject } = getUserEditSchema(permissions);
	const editableProperties = Object.keys(userEditSchemaObject);
	return updateKeys.every((key) => editableProperties.includes(key));
};
