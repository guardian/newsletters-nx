import { SESClient } from '@aws-sdk/client-ses';
import { getStandardAwsConfig } from '../aws/aws-config-service';

export const makeSesClient = () => {
	const emailClient = new SESClient(getStandardAwsConfig());
	return emailClient;
};
