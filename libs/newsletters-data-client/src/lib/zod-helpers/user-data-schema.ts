import type { ZodObject, ZodRawShape } from 'zod';
import { newsletterDataSchema } from '../schemas/newsletter-data-type';
import type { UserPermissions } from '../user-profile';

export const getUserEditSchema = (
	permissions: UserPermissions,
): ZodObject<ZodRawShape> => {
	const { editEverything } = permissions;
	if (editEverything) {
		return newsletterDataSchema.pick({
			name: true,
			frequency: true,
			regionFocus: true,
			theme: true,
			status: true,
			restricted: true,
			illustrationCard: true,
			illustrationSquare: true,
			tagCreationStatus: true,
			seriesTag: true,
			composerTag: true,
			composerCampaignTag: true,
			signupPageCreationStatus: true,
			signupPage: true,
			signUpDescription: true,
			signUpEmbedDescription: true,
			mailSuccessDescription: true,
			highlightCardTitle: true,
			brazeCampaignCreationStatus: true,
			brazeNewsletterName: true,
			brazeSubscribeAttributeName: true,
			brazeSubscribeEventNamePrefix: true,
			brazeSubscribeAttributeNameAlternate: true,
		});
	}
	return newsletterDataSchema.pick({});
};
