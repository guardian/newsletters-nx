import guardianPrettierConfig from '@guardian/prettier';

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
	...guardianPrettierConfig,
	overrides: [
		...(guardianPrettierConfig.overrides ?? []),
		{
			files: '*.feature',
			options: {
				plugins: ['prettier-plugin-gherkin'],
			},
		},
	],
};

export default config;
