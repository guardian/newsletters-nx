import guardian from '@guardian/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		files: ['src/**/*.ts', 'src/**/*.tsx'],
		extends: [guardian.configs.recommended, guardian.configs.react],
		languageOptions: {
			parserOptions: {
				projectService: false,
				project: './tsconfig.app.json',
			},
		},
		rules: {
			// TODO: Remove and revisit set-state-in-effect issues.
			'react-hooks/set-state-in-effect': 'warn',
			// TODO: Remove and revisit static-components issues.
			'react-hooks/static-components': 'warn',
			// Typescript already does this.
			'react/prop-types': 'off',
		},
	},
	{
		// Config files
		files: ['eslint.config.mjs', 'vite.config.ts'],
		extends: [guardian.configs.recommended],
		languageOptions: {
			parserOptions: {
				projectService: false,
				project: './tsconfig.conf.json',
			},
		},
	},
]);
