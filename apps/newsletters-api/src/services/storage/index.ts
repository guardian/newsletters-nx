import {
	// InMemoryNewsletterStorage,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import type {
	DraftStorage,
	NewsletterStorage,
} from '@newsletters-nx/newsletters-data-client';
import { isUsingInMemoryStorage } from '../../apiDeploymentSettings';
import { makeInMemoryStorageInstance } from './inMemoryStorageInstance';
import { getS3Params } from './s3ParamsFromEnv';
import {makeNewsletterStorageInstance, makeS3DraftStorageInstance} from './s3StorageInstance';
// todo - remove all this - was not working - hacked to make behave
const s3Params = getS3Params(); // rename this and have it return a  client
const canUseS3 = !isUsingInMemoryStorage() && s3Params;

// TO DO - how to handle cases in production with missing s3 params?
const draftStore: DraftStorage = canUseS3
	? makeS3DraftStorageInstance(s3Params)
	: makeInMemoryStorageInstance();

// const validNewsletters = newslettersData.filter((item) =>
// 	isNewsletterData(item),
// );

// const newsletterStore: NewsletterStorage = new InMemoryNewsletterStorage(
// 	validNewsletters as unknown as NewsletterData[],
// );

const newsletterStore: NewsletterStorage = makeNewsletterStorageInstance(s3Params!);
const launchService = new LaunchService(draftStore, newsletterStore);

export { draftStore, newsletterStore, launchService };
