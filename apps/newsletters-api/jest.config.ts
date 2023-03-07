/* eslint-disable -- We want default export for config files */
export default {
	displayName: 'newsletters-api',
	preset: '../../jest.preset.js',
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
	moduleFileExtensions: ['ts', 'js', 'html'],
	coverageDirectory: '../../coverage/apps/newsletters-api',
};
