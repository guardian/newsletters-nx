export const LOCAL_PROFILE = 'workflow';

export const IS_RUNNING_LOCALLY = true as boolean;

export const STAGE = process.env.STAGE ?? 'CODE'; // locally we use CODE AppSync API

export const { S3_REGIONS } = process.env;
