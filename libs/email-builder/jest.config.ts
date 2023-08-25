/* eslint-disable -- config file*/
export default {
	displayName: 'email-builder',
	preset: '../../jest.preset.js',
	transform: {
		'^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
		'^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
	coverageDirectory: '../../coverage/libs/email-builder',
};
