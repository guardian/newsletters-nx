import type { NewsletterDataWithMeta } from '../newsletter-data-type';
import type { SuccessfulStorageResponse } from '../storage-response-types';
import type { DraftWithoutId } from "./DraftStorage";
import { InMemoryDraftStorage } from "./InMemoryDraftStorage";

const getMockNewsletterData = () => ({
	identityName: 'foo-identityName',
	name: 'foo-name',
	listId: undefined,
	stage: 'paused',
	emailConfirmation: false,
	brazeSubscribeAttributeName: 'foo_brazeSubscribeAttributeName',
	brazeSubscribeEventNamePrefix: 'foo_brazeSubscribeEventNamePrefix',
	brazeNewsletterName: 'foo_brazeNewsletterName',
	theme: 'news',
	group: 'news',
	signUpHeadline: 'foo-signUpHeadline',
	signUpDescription: 'foo-signUpDescription',
	signUpEmbedDescription: 'foo-signUpEmbedDescription',
	regionFocus: 'UK',
	frequency: 'daily',
	listIdV1: 123,
	figmaIncludesThrashers: false,
	launchDate: new Date('2023-08-14T09:27:40+00:00')
}) as DraftWithoutId;

export const isSuccessfulStorageResponse = (input: unknown): input is SuccessfulStorageResponse<NewsletterDataWithMeta> => {
	return input !== null && typeof input === 'object' && 'ok' in input && input.ok === true;
}

describe('InMemoryDraftStorage', () => {
	test('it should create a daft with expected defaults', async () => {
		const draftStorage = new InMemoryDraftStorage();
		const draftNewsletter = await draftStorage.create(getMockNewsletterData(), {email: 'foo@bar.baz', name: 'foo-name'});

		if (!isSuccessfulStorageResponse(draftNewsletter)) throw new Error(JSON.stringify(draftNewsletter));

		const {
			data: {
				brazeCampaignCreationsStatus,
				ophanCampaignCreationsStatus,
				signupPageCreationsStatus,
				tagCreationsStatus
			}
		} = draftNewsletter;

		[brazeCampaignCreationsStatus, ophanCampaignCreationsStatus, signupPageCreationsStatus, tagCreationsStatus].forEach(status => {
			expect(status).toEqual('NOT_REQUESTED');
		});
	});
});
