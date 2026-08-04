/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"transpileOnly": true} */
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from '../../tsconfig.base.json';
import type { Config } from 'jest';
/* eslint-disable -- config file*/
export default {
	displayName: 'util',
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
	coverageDirectory: '../../coverage/libs/util',
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/../..',
	}),
} satisfies Config;
