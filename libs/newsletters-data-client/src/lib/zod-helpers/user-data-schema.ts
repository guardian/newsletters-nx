import { newsletterDataSchema } from '../newsletter-data-type';
import type { UserPermissions } from '../user-profile';

export const getUserEditSchema = (permissions: UserPermissions) => {
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
		}) as typeof newsletterDataSchema;
	}
	if (editBraze) {
		return newsletterDataSchema.pick({
			brazeCampaignCreationsStatus: true,
			brazeNewsletterName: true,
			brazeSubscribeAttributeName: true,
			brazeSubscribeEventNamePrefix: true,
			brazeSubscribeAttributeNameAlternate: true,
		}) as typeof newsletterDataSchema;
	}
	if (editOphan) {
		return newsletterDataSchema.pick({
			ophanCampaignCreationsStatus: true,
		}) as typeof newsletterDataSchema;
	}
	if (editTags) {
		return newsletterDataSchema.pick({
			tagCreationsStatus: true,
			seriesTag: true,
			composerTag: true,
			composerCampaignTag: true,
		}) as typeof newsletterDataSchema;
	}
	if (editSignUpPage) {
		return newsletterDataSchema.pick({
			signupPageCreationsStatus: true,
			signupPage: true,
			signUpDescription: true,
		}) as typeof newsletterDataSchema;
	}
	throw new Error('No permissions found');
};
