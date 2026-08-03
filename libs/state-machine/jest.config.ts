/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"transpileOnly": true} */
import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from '../../tsconfig.base.json';

export default {
	displayName: 'state-machine',
	globals: {},
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
	coverageDirectory: '../../coverage/libs/state-machine',
} satisfies Config;
