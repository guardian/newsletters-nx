import guardian from '@guardian/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		files: ['**/*.ts', '**/*.spec.ts'],
		ignores: ['.features-gen/**'],
		extends: [guardian.configs.recommended],
		languageOptions: {
			parserOptions: {
				projectService: false,
				project: './tsconfig.json',
			},
		},
	},
	{
		// Config files
		files: ['eslint.config.mjs', 'playwright.config.ts'],
		extends: [guardian.configs.recommended],
		languageOptions: {
			parserOptions: {
				projectService: false,
				project: './tsconfig.conf.json',
			},
		},
	},
]);
