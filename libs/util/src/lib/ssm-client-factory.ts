import { SSMClient } from '@aws-sdk/client-ssm';

export const getSsmClient = () => {
	return new SSMClient({
		region: 'eu-west-1',
	});
};
