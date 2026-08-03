import guardian from '@guardian/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		files: ['src/**/*.ts'],
		extends: [guardian.configs.recommended],
		languageOptions: {
			parserOptions: {
				projectService: false,
				project: './tsconfig.lib.json',
			},
		},
	},
	{
		files: ['src/**/*.spec.ts'],
		extends: [guardian.configs.recommended, guardian.configs.jest],
		languageOptions: {
			parserOptions: {
				projectService: false,
				project: './tsconfig.spec.json',
			},
		},
	},
	{
		// Config files
		files: ['eslint.config.mjs', 'jest.config.ts'],
		extends: [guardian.configs.recommended],
		languageOptions: {
			parserOptions: {
				projectService: false,
				project: './tsconfig.conf.json',
			},
		},
	},
]);
