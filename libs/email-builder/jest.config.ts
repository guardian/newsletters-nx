/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"transpileOnly": true} */
/* eslint-disable -- config file*/
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from '../../tsconfig.base.json';
import type { Config } from 'jest';
export default {
	displayName: 'email-builder',
	transform: {
		'^.+\\.[tj]sx?$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig.spec.json',
			},
		],
	},
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/../..',
	}),
	setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
	coverageDirectory: '../../coverage/libs/email-builder',
} satisfies Config;
