import { SSMClient } from '@aws-sdk/client-ssm';
import * as creds from '@aws-sdk/credential-providers';

export const getSsmClient = () => {
	const { STAGE } = process.env;

	if (STAGE === 'DEV') {
		console.log('Using dev credentials');
		return new SSMClient({
			region: 'eu-west-1',
			credentials: creds.fromIni({profile: 'frontend'}),
		});
	}
	return new SSMClient({
		region: 'eu-west-1',
	});
};
