/* eslint-disable -- config file*/
export default {
	displayName: 'email-builder',
	preset: '../../jest.preset.js',
	transform: {
		'^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
		'^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
	},
	setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
	coverageDirectory: '../../coverage/libs/email-builder',
};
