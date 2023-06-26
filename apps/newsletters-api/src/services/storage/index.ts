import {
	DraftService,
	InMemoryNewsletterStorage,
	isNewsletterData,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import type {
	DraftStorage,
	NewsletterData,
	NewsletterStorage,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client';
import newslettersData from '../../../static/newsletters.local.json';
import { isUsingInMemoryStorage } from '../../apiDeploymentSettings';
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
	new LaunchService(draftStore, newsletterStore, userProfile);

const makeDraftServiceForUser = (userProfile: UserProfile) =>
	new DraftService(draftStore, userProfile);

export {
	draftStore,
	newsletterStore,
	makelaunchServiceForUser,
	makeDraftServiceForUser,
};
