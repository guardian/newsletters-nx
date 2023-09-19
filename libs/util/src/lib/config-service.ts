import { getSsmClient } from './ssm-client-factory';

type Config = Record<string, { value: string; timeStamp: number }>;

let state: Config = {};

const getPath = (key: string) => {
	const { STAGE, STACK, APP } = process.env;
	if (!(STAGE && STACK && APP)) {
		throw new Error('Missing environment variables');
	}
	return `/${STAGE}/${STACK}/${APP}/${key}`;
};
export const getConfigValue = async (
	key: string,
	options: {
		defaultValue?: string;
		/** the maximum age in ms that a cached value can be - if the age exceeds this, a fresh value will be fetched  */
		maxAge?: number;
	} = {},
): Promise<string> => {
	const requestTime = Date.now();
	const { defaultValue, maxAge = Infinity } = options;
	const entryFromState = state[key];

	if (entryFromState) {
		const age = requestTime - entryFromState.timeStamp;
		if (age <= maxAge) {
			console.log(
				`returning cached value for getConfigValue ${key} (${age}ms old)`,
			);
			return entryFromState.value;
		}
	}

	console.log(
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
			[key]: { value: value.Parameter.Value, timeStamp: requestTime },
		};
		return value.Parameter.Value;
	}
	if (defaultValue) {
		return defaultValue;
	}
	throw new Error(`Config value for ${key} not found`);
};
