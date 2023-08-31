import type {ZodObject, ZodRawShape} from "zod";
import {newsletterDataSchema} from "../schemas/newsletter-data-type";
import type { UserPermissions } from '../user-profile';

export const getUserEditSchema = (permissions: UserPermissions): ZodObject<ZodRawShape> => {
	const { editBraze, editOphan, editTags, editSignUpPage, editNewsletters } =
		permissions;
	if (editNewsletters) {
		return newsletterDataSchema.pick({
			tagCreationsStatus: true,
			brazeCampaignCreationsStatus: true,
			ophanCampaignCreationsStatus: true,
			signupPageCreationsStatus: true,
			signupPage: true,
			signUpDescription: true,
		});
	}
	if (editBraze) {
		return newsletterDataSchema.pick({
			brazeCampaignCreationsStatus: true,
			brazeNewsletterName: true,
			brazeSubscribeAttributeName: true,
			brazeSubscribeEventNamePrefix: true,
			brazeSubscribeAttributeNameAlternate: true,
		});
	}
	if (editOphan) {
		return newsletterDataSchema.pick({
			ophanCampaignCreationsStatus: true,
		});
	}
	if (editTags) {
		return newsletterDataSchema.pick({
			tagCreationsStatus: true,
			seriesTag: true,
			composerTag: true,
			composerCampaignTag: true,
		});
	}
	if (editSignUpPage) {
		return newsletterDataSchema.pick({
			signupPageCreationsStatus: true,
			signupPage: true,
			signUpDescription: true,
		});
	}
	throw new Error('No permissions found');
};
