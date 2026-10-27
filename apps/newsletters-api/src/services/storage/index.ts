import type { SESClient } from '@aws-sdk/client-ses';
import type {
	DraftStorage,
	EmailEnvInfo,
	LayoutStorage,
	NewsletterData,
	NewsletterStorage,
	UserProfile,
} from '@newsletters-nx/newsletters-data-client/server';
import {
	DraftService,
	InMemoryLayoutStorage,
	InMemoryNewsletterStorage,
	isNewsletterData,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client/server';
import layoutsData from '../../../static/layouts.local.json';
import newslettersLocalData from '../../../static/newsletters.local.json';
import newslettersSeedData from '../../../static/newsletters.seed.json';
import { isUsingInMemoryStorage } from '../../apiDeploymentSettings';
import { makeEmailEnvInfo } from '../notifications/email-env';
import { makeSesClient } from '../notifications/email-service';
import { makeInMemoryStorageInstance } from './inMemoryStorageInstance';
import {
	getS3LayoutStore,
	getS3NewsletterStore,
	makeS3DraftStorageInstance,
} from './s3StorageInstance';

const newslettersData = [
	...(newslettersSeedData as unknown as NewsletterData[]),
	...(newslettersLocalData as unknown as NewsletterData[]),
];

const isUsingInMemoryStore = isUsingInMemoryStorage();

const draftStore: DraftStorage = isUsingInMemoryStore
	? makeInMemoryStorageInstance()
	: makeS3DraftStorageInstance();

const validNewsletters = newslettersData.filter((item) =>
	isNewsletterData(item),
);
const newsletterStore: NewsletterStorage = isUsingInMemoryStore
	? new InMemoryNewsletterStorage(validNewsletters)
	: getS3NewsletterStore();

const layoutStore: LayoutStorage = isUsingInMemoryStore
	? new InMemoryLayoutStorage(layoutsData)
	: getS3LayoutStore();

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
