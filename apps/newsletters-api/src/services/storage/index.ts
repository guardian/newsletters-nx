import type { SESClient } from '@aws-sdk/client-ses';
import type {
	DraftStorage,
	EditionsLayouts,
	EmailEnvInfo,
	LayoutStorage,
	NewsletterData,
	NewsletterStorage,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import {
	DraftService,
	InMemoryLayoutStorage,
	InMemoryNewsletterStorage,
	isNewsletterData,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import layoutsData from '../../../static/layouts.local.json';
import newslettersData from '../../../static/newsletters.local.json';
import { isUsingInMemoryNewsletterStorage } from '../../apiDeploymentSettings';
import { makeEmailEnvInfo } from '../notifications/email-env';
import { makeSesClient } from '../notifications/email-service';
import { makeInMemoryStorageInstance } from './inMemoryStorageInstance';
import {
	getS3NewsletterStore,
	makeS3DraftStorageInstance,
} from './s3StorageInstance';

const isUsingInMemoryNewslettersStore = isUsingInMemoryNewsletterStorage();

const draftStore: DraftStorage = isUsingInMemoryNewslettersStore
	? makeInMemoryStorageInstance()
	: makeS3DraftStorageInstance();

const validNewsletters = newslettersData.filter((item) =>
	isNewsletterData(item),
);
const newsletterStore: NewsletterStorage = isUsingInMemoryNewslettersStore
	? new InMemoryNewsletterStorage(
			validNewsletters as unknown as NewsletterData[],
	  )
	: getS3NewsletterStore();

const layoutStore: LayoutStorage = new InMemoryLayoutStorage(
	layoutsData as unknown as EditionsLayouts,
);

const makelaunchServiceForUser = (userProfile: UserProfile) =>
	new LaunchService(
		draftStore,
		newsletterStore,
		userProfile,
		makeSesClient(),
		makeEmailEnvInfo(),
	);

const makeDraftServiceForUser = (
	userProfile: UserProfile,
	emailClient: SESClient,
	emailEnvInfo: EmailEnvInfo,
) => new DraftService(draftStore, userProfile, emailClient, emailEnvInfo);

export {
	draftStore,
	makeDraftServiceForUser,
	makelaunchServiceForUser,
	newsletterStore,
	layoutStore,
};
