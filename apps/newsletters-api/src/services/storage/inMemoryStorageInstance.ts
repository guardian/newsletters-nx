import { InMemoryDraftStorage } from '@newsletters-nx/newsletters-data-client';

export const makeInMemoryStorageInstance = () =>
	new InMemoryDraftStorage([
		{
			name: 'Avon Recumbent',
			category: 'fronts-based',
			signUpDescription:
				'Quod nobis aperiam aperiam ipsum nobis officiis explicabo molestias quibusdam.',
			frequency: 'Weekly',
			status: 'paused',
			restricted: false,
			emailConfirmation: false,
			signUpEmbedDescription: "We'll send you Avon Recumbent weekly",
			theme: 'culture',
			group: 'Work',
			regionFocus: 'UK',
			listId: 5770,
			exampleUrl: '/world/series/series-avon-recumbent/latest/email',
			signupPage:
				'/global/sign-up-for-the-avon-recumbent-newsletter-our-free-email',
			creationTimeStamp: 1633539258449,
			figmaIncludesThrashers: false,
			launchDate: new Date('1970-01-02T00:21:18.876Z'),
			signUpPageDate: new Date('1970-01-02T00:21:18.876Z'),
			thrasherDate: new Date('1970-01-02T00:21:18.876Z'),
			privateUntilLaunch: false,
			onlineArticle: 'Web for all sends',
		},

		{
			listId: 7000,
			name: 'Test draft newsletter',
			category: 'article-based',
			identityName: 'test-draft-newsletter',
			brazeSubscribeEventNamePrefix: 'test_draft_newsletter',
			brazeNewsletterName: 'Editorial_Testdraftnewsletter',
			brazeSubscribeAttributeName: 'Testdraftnewsletter_Subscribe_Email',
			brazeSubscribeAttributeNameAlternate: [
				'email_subscribe_test_draft_newsletter',
			],
			campaignName: 'Testdraftnewsletter',
			campaignCode: 'testdraftnewsletter_email',
			creationTimeStamp: 1633539258449,
		},
		{
			listId: 7001,
			name: 'Other Test draft newsletter',
			category: 'other',
			theme: 'news',
			creationTimeStamp: 1633539258449,
		},
		{
			name: 'Response Academic',
			category: 'article-based-legacy',
			listId: 7002,
			theme: 'lifestyle',
			signUpDescription:
				'Officia neque totam temporibus incidunt ad dolorem quo sit mollitia.\\net molestiae reprehenderit.\\nquo dolores beatae suscipit veniam maiores delectus.',
			creationTimeStamp: 1633539258449,
		},
		{
			name: 'Wagon Automotive',
			signUpDescription: 'Mollitia saepe odio',
			category: 'article-based',
			frequency: 'Weekly',
			theme: 'news',
			group: 'Work',
			listId: 7009,
			creationTimeStamp: 1633539258449,
		},
		{
			name: 'Background Hatchback',
			category: 'fronts-based',
			signUpDescription:
				'Veritatis ipsum asperiores optio sunt eum ab architecto.',
			frequency: 'Weekly',
			theme: 'news',
			group: 'Opinion',
			listId: 7010,
			regionFocus: 'UK',
			creationTimeStamp: 1633539258449,
			launchDate: new Date('1970-01-02T00:21:18.876Z'),
			signUpPageDate: new Date('1970-01-02T00:21:18.876Z'),
			thrasherDate: new Date('1970-01-02T00:21:18.876Z'),
		},
	]);
