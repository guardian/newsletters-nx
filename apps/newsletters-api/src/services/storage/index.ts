import {
	InMemoryNewsletterStorage,
	isNewsletterData,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import type {
	DraftStorage,
	NewsletterData,
	NewsletterStorage,
} from '@newsletters-nx/newsletters-data-client';
import newslettersData from '../../../static/newsletters.local.json';
import { isUsingInMemoryStorage } from '../../apiDeploymentSettings';
import { makeInMemoryStorageInstance } from './inMemoryStorageInstance';
import { getS3Params } from './s3ParamsFromEnv';
import { makeS3DraftStorageInstance } from './s3StorageInstance';

const s3Params = getS3Params();
const canUseS3 = !isUsingInMemoryStorage() && s3Params;

// TO DO - how to handle cases in production with missing s3 params?
const draftStore: DraftStorage = canUseS3
	? makeS3DraftStorageInstance(s3Params)
	: makeInMemoryStorageInstance();

const validNewsletters = newslettersData.filter((item) =>
	isNewsletterData(item),
);

const newsletterStore: NewsletterStorage = new InMemoryNewsletterStorage(
	validNewsletters as unknown as NewsletterData[],
);

const launchService = new LaunchService(draftStore, newsletterStore);

export { draftStore, newsletterStore, launchService };
