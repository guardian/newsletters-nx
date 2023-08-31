import type { FastifyRequest } from 'fastify/types/request';
import type { UserProfile } from '@newsletters-nx/newsletters-data-client';
import {
	getUserEditSchema,
	isPartialNewsletterData,
} from '@newsletters-nx/newsletters-data-client';
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

export const isAuthorisedToUpdateNewsletter = async (
	profile: UserProfile | undefined,
	request: FastifyRequest,
): Promise<boolean> => {
	if (!profile) return false;
	const permissions = await permissionService.get(profile);
	const { editNewsletters } = permissions;

	if (editNewsletters) return true;

	const { body: modifications } = request;

	if (!isPartialNewsletterData(modifications))  {
		throw new Error('Invalid newsletter data');
	}

	const updateKeys = Object.keys(modifications);

	const { shape: userEditSchemaObject } = getUserEditSchema(permissions);
	const editableProperties = Object.keys(userEditSchemaObject);
	return updateKeys.every((key) => editableProperties.includes(key));
};
