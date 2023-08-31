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
	// get the users permissions and check if they have editNewsletters permission - if so, return true (because they can do whatever they want)
	// if not, check what edit permission they have and then check the keys in the payload to see if they are allowed to update them
	// if they are allowed to update them, return true, otherwise return false
	if (!profile) return false;
	const permissions = await permissionService.get(profile);
	const { editNewsletters } = permissions;
	if (editNewsletters) return true;

	const { body: modifications } = request;

	if (!isPartialNewsletterData(modifications))  {
		throw new Error('Invalid newsletter data');
	}
	const updateKeys = Object.keys(modifications);


	// @typescript-eslint/no-unsafe-call -- this is safe
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument -- this is safe
	const userEditSchema = Object.keys(getUserEditSchema(permissions));
	return updateKeys.every((key) => userEditSchema.includes(key));
};
