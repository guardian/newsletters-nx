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

type Config = Record<string, string>;

let state: Config | undefined;

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

	if (state?.[key]) {
		console.info(
			`returning cached value for getConfigValue ${key}`
		);
		return state[key] as string;
	}

	console.info(
		`getConfigValue for ${key}, defaultValue: ${defaultValue ?? 'undefined'}`,
	);
	const ssmClient = getSsmClient();
	const path = getPath(key);

	const value = await ssmClient
		.getParameter({
			Name: path,
			WithDecryption: true,
		})
		.promise();
	if (value.Parameter?.Value) {
		state = {
			...state,
			[key]: value.Parameter.Value,
		}
		return value.Parameter.Value;
	}
	if (defaultValue) {
		return defaultValue;
	}
	throw new Error(`Config value for ${key} not found`);
};
