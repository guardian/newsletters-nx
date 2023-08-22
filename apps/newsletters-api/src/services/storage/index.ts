import type { SESClient } from '@aws-sdk/client-ses';
import type {
	DraftStorage,
	EmailEnvInfo,
	NewsletterData,
	NewsletterStorage,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import {
	DraftService,
	InMemoryNewsletterStorage,
	isNewsletterData,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import newslettersData from '../../../static/newsletters.local.json';
import { isUsingInMemoryStorage } from '../../apiDeploymentSettings';
import {
	makeEmailEnvInfo,
	makeSesClient,
} from '../notifications/email-service';
import { makeInMemoryStorageInstance } from './inMemoryStorageInstance';
import {
	getS3NewsletterStore,
	makeS3DraftStorageInstance,
} from './s3StorageInstance';

const isUsingInMemoryStore = isUsingInMemoryStorage();

const draftStore: DraftStorage = isUsingInMemoryStore
	? makeInMemoryStorageInstance()
	: makeS3DraftStorageInstance();

const validNewsletters = newslettersData.filter((item) =>
	isNewsletterData(item),
);
const newsletterStore: NewsletterStorage = isUsingInMemoryStore
	? new InMemoryNewsletterStorage(
			validNewsletters as unknown as NewsletterData[],
	  )
	: getS3NewsletterStore();

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
	emailClent: SESClient,
	emailEnvInfo: EmailEnvInfo,
) => new DraftService(draftStore, userProfile, emailClent, emailEnvInfo);

export {
	draftStore,
	makeDraftServiceForUser,
	makelaunchServiceForUser,
	newsletterStore,
};
