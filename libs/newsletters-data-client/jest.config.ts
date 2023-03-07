/* eslint-disable -- We want default export for config files */
export default {
	displayName: 'newsletters-data-client',
	preset: '../../jest.preset.js',
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
};
