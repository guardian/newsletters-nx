import type { Newsletter } from '@newsletters-nx/newsletters-data-client';

const BLANK_NEWSLETTER: Newsletter = {
	identityName: '',
	name: '',
	cancelled: false,
	restricted: false,
	paused: false,
	emailConfirmation: false,
	brazeNewsletterName: '',
	brazeSubscribeAttributeName: '',
	brazeSubscribeEventNamePrefix: '',
	theme: 'news',
	group: 'News in depth',
	description: '',
	frequency: 'Weekly',
	listIdV1: -1,
	listId: 1,
	signupPage: '',
	emailEmbed: {
		name: '',
		title: '',
		description: '',
		successHeadline: 'Subscription confirmed',
		successDescription: '',
		hexCode: '#DCDCDC',
	},
	campaignName: '',
	campaignCode: '',
	brazeSubscribeAttributeNameAlternate: [],
	illustration: {
		circle: '',
	},
};

export const makeBlankNewsletter = (): Newsletter => ({ ...BLANK_NEWSLETTER });

