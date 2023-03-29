import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import { isUsingTestS3Storage } from '../../apiDeploymentSettings';
import { inMemoryStorageInstance } from './inMemoryStorageInstance';
import { s3DraftStorage } from './s3StorageInstance';

const draftStore: DraftStorage = isUsingTestS3Storage()
	? s3DraftStorage
	: inMemoryStorageInstance;

export { draftStore };
