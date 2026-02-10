/* eslint-disable -- We want default export for config files */
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
	server: {
		port: 4200,
		host: 'localhost',
		proxy: {
			'/api': {
				/** @TODO - Read target from env var / param instead of hardcoding */
				target: 'http://0.0.0.0:3000',
				secure: false,
			},
		},
		fs: {
			allow: [
				// Allow serving files from project root (two levels up)
				path.resolve(__dirname, '../..'),
			],
		},
		allowedHosts: ['newsletters-tool.local.dev-gutools.co.uk'],
	},
	plugins: [
		react(),
		viteTsConfigPaths({
			root: '../../',
		}),
	],

	// Uncomment this if you are using workers.
	// worker: {
	//  plugins: [
	//    viteTsConfigPaths({
	//      root: '../../',
	//    }),
	//  ],
	// },

	define: {
		'import.meta.vitest': undefined,
	},
	test: {
		globals: true,
		cache: {
			dir: '../../node_modules/.vitest',
		},
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		includeSource: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
	},
});
