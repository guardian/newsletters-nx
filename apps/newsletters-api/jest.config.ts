/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"transpileOnly": true} */
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from '../../tsconfig.base.json';
import type { Config } from 'jest';
/* eslint-disable -- We want default export for config files */
export default {
	displayName: 'newsletters-api',
	globals: {},
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]s$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig.spec.json',
			},
		],
	},
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/../..',
	}),
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: '../../coverage/apps/newsletters-api',
} satisfies Config;
