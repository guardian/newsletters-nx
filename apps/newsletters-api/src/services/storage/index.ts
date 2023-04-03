import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { isUsingTestS3Storage } from '../../apiDeploymentSettings';
import { makeInMemoryStorageInstance } from './inMemoryStorageInstance';
import { getS3Params } from './s3ParamsFromEnv';
import { makeS3DraftStorageInstance } from './s3StorageInstance';

const s3Params = getS3Params();
const canUseS3 = !!(isUsingTestS3Storage() && s3Params);

const draftStore: DraftStorage = canUseS3
	? makeS3DraftStorageInstance(s3Params)
	: makeInMemoryStorageInstance();

export { draftStore };
