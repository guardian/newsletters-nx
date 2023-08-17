import { SharedIniFileCredentials, SSM } from 'aws-sdk';

export const getSsmClient = () => {
	const { STAGE, AWS_PROFILE } = process.env;

	const shouldUseProfileCredentials = !!(STAGE && STAGE === 'DEV');

	if (shouldUseProfileCredentials) {
		const profile = AWS_PROFILE ?? 'frontend';

		return new SSM({
			region: 'eu-west-1',
			credentials: new SharedIniFileCredentials({ profile }),
		});
	}
	return new SSM({
		region: 'eu-west-1',
	});
};
