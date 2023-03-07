/* eslint-disable -- We want default export for config files */
export default {
	displayName: 'newsletter-workflow',
	preset: '../../jest.preset.js',
	globals: {},
	testEnvironment: 'node',
	transform: {
		'^.+\\.[tj]sx?$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig.spec.json',
			},
		],
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
	coverageDirectory: '../../coverage/libs/newsletter-workflow',
};
