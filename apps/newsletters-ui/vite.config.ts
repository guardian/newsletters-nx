import path from 'path';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const getViteHost = () => {
	// Containers have their a separate loopback interface to the host machine,
	// so to expose a service to the host you must bind to all interfaces on the container.
	const isRunningInDevContainer =
		process.env.IS_NEWSLETTERS_NX_DEVCONTAINER === 'true';
	return isRunningInDevContainer ? '0.0.0.0' : 'localhost';
};

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
		host: getViteHost(),
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
	preview: {
		port: 4200,
		host: getViteHost(),
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				secure: false,
			},
		},
	},
	plugins: [react(), tsConfigPaths()],
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
