import guardian from '@guardian/eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		// playwright-bdd generated test files (regenerated on every `bddgen` run)
		ignores: ['src/ui/.features-gen/**'],
	},
	{
		files: ['**/*.ts', '**/*.spec.ts'],
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
