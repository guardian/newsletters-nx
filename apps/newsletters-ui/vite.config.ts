/* eslint-disable -- We want default export for config files */
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import path from 'path';

export default defineConfig({
	root: __dirname,
	build: {
		outDir: '../../dist/apps/newsletters-ui',
		reportCompressedSize: true,
		commonjsOptions: {
			transformMixedEsModules: true,
		},
	},
	server: {
		port: 4200,
		host: 'localhost',
		proxy: {
			'/api': {
				/** @TODO - Read target from env var / param instead of hardcoding */
				target: 'http://localhost:3000',
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
	plugins: [react(), nxViteTsPaths()],

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
		reporters: ['default'],
		coverage: {
			reportsDirectory: '../../coverage/apps/newsletters-ui',
			provider: 'v8',
		},
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		includeSource: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
	},
});
