import { SharedIniFileCredentials, SSM } from 'aws-sdk';

const getSsmClient = () => {
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

const getPath = (key: string) => {
	const { STAGE, STACK, APP } = process.env;
	if (!STAGE || !STACK || !APP) {
		throw new Error('Missing environment variables');
	}
	return `/${STAGE}/${STACK}/${APP}/${key}`;
};
export const getConfigValue = async (
	key: string,
	defaultValue?: string,
): Promise<string> => {
	console.info(
		`getConfigValue for ${key}, defaultValue: ${defaultValue ?? 'undefined'}`,
	);
	const ssmClient = getSsmClient();
	const path = getPath(key);
	console.info(`path: ${path}`);
	const value = await ssmClient
		.getParameter({
			Name: path,
			WithDecryption: true,
		})
		.promise();
	if (value.Parameter?.Value) {
		return value.Parameter.Value;
	}
	if (defaultValue) {
		return defaultValue;
	}
	throw new Error(`Config value for ${key} not found`);
};
