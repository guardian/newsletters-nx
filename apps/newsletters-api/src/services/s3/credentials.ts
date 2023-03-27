import {
	config,
	CredentialProviderChain,
	EnvironmentCredentials,
	S3,
	SharedIniFileCredentials,
} from 'aws-sdk';

const credentialProvider = new CredentialProviderChain([
	function () {
		return new EnvironmentCredentials('AWS');
	},
	function () {
		return new SharedIniFileCredentials({ profile: 'developerPlayground' });
	},
]);

const REGION = 'eu-west-1';
const BUCKET = 'gu-s3-training-dblatcher';

config.update({
	region: REGION,
	credentialProvider,
});

const s3 = new S3({ apiVersion: '2006-03-01' });

export { s3, BUCKET };
