import { GetParameterCommand } from '@aws-sdk/client-ssm';
import { getSsmClient } from './ssm-client-factory';

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
	key: string,
	defaultValue?: string,
): Promise<string> => {
	if (state?.[key]) {
		console.log(`returning cached value for getConfigValue ${key}`);
		return state[key] as string;
	}
	const path = getPath(key);
	console.log(
		`getConfigValue for ${path}, defaultValue: ${defaultValue ?? 'undefined'}`,
	);

	const ssmClient = getSsmClient();

	const value = await ssmClient.send(
		new GetParameterCommand({
			Name: path,
			WithDecryption: true,
		}),
	);
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
