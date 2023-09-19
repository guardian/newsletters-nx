import type { SSM } from 'aws-sdk';

type Config = Record<string, string>;

let state: Config | undefined;

const getPath = (key: string) => {
	const { STAGE, STACK, APP } = process.env;
	if (!(STAGE && STACK && APP)) {
		throw new Error('Missing environment variables');
	}
	return `/${STAGE}/${STACK}/${APP}/${key}`;
};
export const getConfigValue = async (
	ssmClient: SSM,
	key: string,
	defaultValue?: string,
): Promise<string> => {
	if (state?.[key]) {
		console.log(`returning cached value for getConfigValue ${key}`);
		return state[key] as string;
	}

	console.log(
		`getConfigValue for ${key}, defaultValue: ${defaultValue ?? 'undefined'}`,
	);
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
		};
		return value.Parameter.Value;
	}
	if (defaultValue) {
		return defaultValue;
	}
	throw new Error(`Config value for ${key} not found`);
};
