import type { LegacyNewsletter } from '..';
import type { NewsletterData } from '../lib/schemas/newsletter-data-type';

export const TECHSCAPE_IN_NEW_FORMAT: NewsletterData = {
	identityName: 'tech-scape',
	name: 'TechScape',
	category: 'article-based-legacy',
	status: 'live',
	restricted: false,
	emailConfirmation: false,
	brazeNewsletterName: 'Editorial_TechScape',
	brazeSubscribeAttributeName: 'TechScape_Subscribe_Email',
	brazeSubscribeEventNamePrefix: 'tech_scape',
	theme: 'news',
	group: 'News in depth',
	signUpDescription:
		"Alex Hern's weekly dive in to how technology is shaping our lives",
	signUpEmbedDescription:
		"Alex Hern's weekly dive in to how technology is shaping our lives",
	mailSuccessDescription: "We'll send you TechScape every week",
	regionFocus: undefined,
	frequency: 'Weekly',
	listIdV1: -1,
	listId: 6013,
	signupPage:
		'/info/2022/sep/20/sign-up-for-the-techscape-newsletter-our-free-technology-email',
	campaignName: 'TechScape',
	campaignCode: 'techscape_email',
	brazeSubscribeAttributeNameAlternate: [
		'email_subscribe_tech_scape',
		'TechTonic_Subscribe_Email',
		'email_subscribe_tech_tonic',
	],

	creationTimeStamp: 87678876,
	figmaIncludesThrashers: false,
	launchDate: new Date(87678876),
	signUpPageDate: new Date(87678876),
	thrasherDate: new Date(87678876),
	privateUntilLaunch: false,
	onlineArticle: 'Web for all sends',
	brazeCampaignCreationStatus: 'NOT_REQUESTED',
	ophanCampaignCreationStatus: 'NOT_REQUESTED',
	signupPageCreationStatus: 'NOT_REQUESTED',
	tagCreationStatus: 'NOT_REQUESTED',
};

export const TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS: NewsletterData =
	{
		...TECHSCAPE_IN_NEW_FORMAT,
		regionFocus: 'INT',
		signUpHeadline: 'Sign up for Techscape',
		renderingOptions: {
			displayDate: true,
			displayStandfirst: true,
			displayImageCaptions: false,
		},
		category: 'article-based',
	};

export const VALID_TECHSCAPE: LegacyNewsletter = {
	identityName: 'tech-scape',
	name: 'TechScape',
	cancelled: false,
	restricted: false,
	paused: false,
	emailConfirmation: false,
	brazeNewsletterName: 'Editorial_TechScape',
	brazeSubscribeAttributeName: 'TechScape_Subscribe_Email',
	brazeSubscribeEventNamePrefix: 'tech_scape',
	theme: 'news',
	group: 'News in depth',
	description:
		"Alex Hern's weekly dive in to how technology is shaping our lives",
	regionFocus: undefined,
	frequency: 'Weekly',
	listIdV1: -1,
	listId: 6013,
	signupPage:
		'/info/2022/sep/20/sign-up-for-the-techscape-newsletter-our-free-technology-email',
	emailEmbed: {
		name: 'TechScape',
		title: 'Sign up for TechScape',
		description:
			"Alex Hern's weekly dive in to how technology is shaping our lives",
		successHeadline: 'Subscription confirmed',
		successDescription: "We'll send you TechScape every week",
		hexCode: '#DCDCDC',
	},
	campaignName: 'TechScape',
	campaignCode: 'techscape_email',
	brazeSubscribeAttributeNameAlternate: [
		'email_subscribe_tech_scape',
		'TechTonic_Subscribe_Email',
		'email_subscribe_tech_tonic',
	],
};
