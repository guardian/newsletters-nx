import type { ZodObject, ZodRawShape } from 'zod';
import { newsletterDataSchema } from '../schemas/newsletter-data-type';
import type { UserPermissions } from '../user-profile';

export const getUserEditSchema = (
	permissions: UserPermissions,
): ZodObject<ZodRawShape> => {
	const { editBraze, editOphan, editTags, editSignUpPage, editNewsletters } =
		permissions;
	if (editNewsletters) {
		return newsletterDataSchema.pick({
			name: true,
			frequency: true,
			regionFocus: true,
			theme: true,
			status: true,
			tagCreationStatus: true,
			seriesTag: true,
			composerTag: true,
			composerCampaignTag: true,
			ophanCampaignCreationStatus: true,
			signupPageCreationStatus: true,
			signupPage: true,
			signUpDescription: true,
			brazeCampaignCreationStatus: true,
			brazeNewsletterName: true,
			brazeSubscribeAttributeName: true,
			brazeSubscribeEventNamePrefix: true,
			brazeSubscribeAttributeNameAlternate: true,
		});
	}
	if (editBraze) {
		return newsletterDataSchema.pick({
			brazeCampaignCreationStatus: true,
			brazeNewsletterName: true,
			brazeSubscribeAttributeName: true,
			brazeSubscribeEventNamePrefix: true,
			brazeSubscribeAttributeNameAlternate: true,
		});
	}
	if (editOphan) {
		return newsletterDataSchema.pick({
			ophanCampaignCreationStatus: true,
		});
	}
	if (editTags) {
		return newsletterDataSchema.pick({
			tagCreationStatus: true,
			seriesTag: true,
			composerTag: true,
			composerCampaignTag: true,
		});
	}
	if (editSignUpPage) {
		return newsletterDataSchema.pick({
			signupPageCreationStatus: true,
			signupPage: true,
			signUpDescription: true,
		});
	}
	return newsletterDataSchema.pick({});
};
