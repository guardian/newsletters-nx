import { InMemoryDraftStorage } from '@newsletters-nx/newsletters-data-client';

const storageInstance = new InMemoryDraftStorage([
	{
		listId: 7000,
		name: 'Test draft newsletter',
		identityName: 'test-draft-newsletter',
		brazeSubscribeEventNamePrefix: 'test_draft_newsletter',
		brazeNewsletterName: 'Editorial_Testdraftnewsletter',
		brazeSubscribeAttributeName: 'Testdraftnewsletter_Subscribe_Email',
		brazeSubscribeAttributeNameAlternate:
			'email_subscribe_test_draft_newsletter',
		campaignName: 'Testdraftnewsletter',
		campaignCode: 'testdraftnewsletter_email',
	},
	{
		listId: 7001,
		name: 'Other Test draft newsletter',
		identityName: 'other-test-draft-newsletter',
		brazeSubscribeEventNamePrefix: 'other_test_draft_newsletter',
		brazeNewsletterName: 'Editorial_Othertestdraftnewsletter',
		brazeSubscribeAttributeName: 'Othertestdraftnewsletter_Subscribe_Email',
		brazeSubscribeAttributeNameAlternate:
			'email_subscribe_other_test_draft_newsletter',
		campaignName: 'Othertestdraftnewsletter',
		campaignCode: 'othertestdraftnewsletter_email',
		theme: 'news',
	},
]);

export { storageInstance };
