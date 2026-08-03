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
