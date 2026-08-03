/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"transpileOnly": true} */
import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from '../../tsconfig.base.json';

export default {
	displayName: 'newsletters-data-client',
	globals: {},
	transform: {
		'^.+\\.[tj]s$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig.spec.json',
			},
		],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: '../../coverage/libs/newsletters-data-client',
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/../..',
	}),
} satisfies Config;
