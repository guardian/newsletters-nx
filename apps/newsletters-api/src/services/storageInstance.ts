import { InMemoryDraftStorage } from '@newsletters-nx/newsletters-data-client';

const storageInstance = new InMemoryDraftStorage([
	{ listId: 7000, name: 'Test draft newsletter' },
	{ listId: 7001, name: 'Other Test draft newsletter', theme: 'news' },
	{
		name: 'Response Academic',
		identityName: 'response-academic',
		brazeSubscribeEventNamePrefix: 'response_academic',
		brazeNewsletterName: 'Editorial_ResponseAcademic',
		brazeSubscribeAttributeName: 'ResponseAcademic_Subscribe_Email',
		brazeSubscribeAttributeNameAlternate: 'email_subscribe_response_academic',
		campaignName: 'ResponseAcademic',
		campaignCode: 'responseacademic_email',
		listId: 7002,
		theme: 'lifestyle',
		description:
			'Officia neque totam temporibus incidunt ad dolorem quo sit mollitia.\\net molestiae reprehenderit.\\nquo dolores beatae suscipit veniam maiores delectus.',
	},
	{
		identityName: 'wagon-automotive',
		name: 'Wagon Automotive',
		description: 'Mollitia saepe odio',
		frequency: 'Weekly',
		brazeNewsletterName: 'Editorial_WagonAutomotiveAu',
		brazeSubscribeAttributeName: 'WagonAutomotiveAu_Subscribe_Email',
		brazeSubscribeEventNamePrefix: 'wagon_automotive_AU',
		theme: 'work',
		group: 'Work',
		listId: 7009,
	},
	{
		identityName: 'background-hatchback',
		name: 'Background Hatchback',
		description: 'Veritatis ipsum asperiores optio sunt eum ab architecto.',
		frequency: 'Weekly',
		brazeNewsletterName: 'Editorial_BackgroundHatchbackUk',
		brazeSubscribeAttributeName: 'BackgroundHatchbackUk_Subscribe_Email',
		brazeSubscribeEventNamePrefix: 'background_hatchback_UK',
		theme: 'work',
		group: 'Opinion',
		listId: 7010,
	},
]);

export { storageInstance };
