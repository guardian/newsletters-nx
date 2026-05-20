/* eslint-disable -- We want default export for config files */
/// <reference types="vitest" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import path from 'path';

// @aws-sdk packages use Node.js built-ins (fs, crypto, etc.) unavailable in the
// browser. The UI never calls AWS APIs directly — all AWS calls go via the API
// server. This transform hook rewrites @aws-sdk value imports in project source
// files to inline stub classes before Vite ever resolves or pre-bundles them,
// avoiding both "missing export" and "Outdated Optimize Dep" (504) errors.
const awsSdkBrowserStub = (): Plugin => ({
	name: 'aws-sdk-browser-stub',
	enforce: 'pre',
	transform(code, id) {
		if (id.includes('/node_modules/')) return null;
		if (!code.includes('@aws-sdk/')) return null;

		const result = code
			// Named value imports — but NOT `import type { ... }`
			.replace(
				/^import\s+(?!type[\s{])(\{[^}]+\})\s+from\s+['"]@aws-sdk\/[^'"]+['"]\s*;?/gm,
				(_, imports) =>
					imports
						.slice(1, -1)
						.split(',')
						.map((s: string) => s.trim())
						.filter(Boolean)
						.map((imp: string) => {
							const local = imp.split(/\s+as\s+/).pop()!.trim();
							return `const ${local} = class ${local} {};`;
						})
						.join('\n'),
			)
			// Namespace imports: import * as foo from '@aws-sdk/...'
			.replace(
				/^import\s+\*\s+as\s+(\w+)\s+from\s+['"]@aws-sdk\/[^'"]+['"]\s*;?/gm,
				(_, name) =>
					`const ${name} = new Proxy({}, { get: () => class {} });`,
			);

		return result !== code ? { code: result, map: null } : null;
	},
});

// Rolldown rc.15 cannot analyse `export * from "./fromTokenFile"` when
// fromTokenFile.js imports `node:fs`. This plugin stubs the two packages that
// hit this bug inside the dep optimiser so the optimiser does not crash on
// startup. It is only added to `optimizeDeps.rolldownOptions.plugins` and
// never affects browser-served files (the transform plugin above handles those).
const awsSdkOptimizerFix = (): Plugin => ({
	name: 'aws-sdk-optimizer-fix',
	enforce: 'pre',
	resolveId(id) {
		if (id === '@aws-sdk/credential-provider-web-identity')
			// prepending the return with \0 (the null unicode character) prevents other
			// plugins from reading the stub and signals that this is a virtual module
			// not to be physically read from disk
			return '\0cred-web-identity-stub';
		if (id === 'node:fs') return '\0node-fs-stub';
		if (id === 'node:fs/promises') return '\0node-fs-promises-stub';
		return undefined;
	},
	load(id) {
		if (id === '\0cred-web-identity-stub')
			return `export const fromTokenFile = () => { throw new Error('not available in browser'); };
export const fromWebToken = () => { throw new Error('not available in browser'); };`;
		if (id === '\0node-fs-stub')
			return `export const promises = {}; export const readFileSync = () => {}; export default {};`;
		if (id === '\0node-fs-promises-stub')
			return `export const readFile = async () => {}; export const writeFile = async () => {};`;
		return undefined;
	},
});

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
	preview: {
		port: 4200,
		host: 'localhost',
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				secure: false,
			},
		},
	},
	plugins: [react(), nxViteTsPaths(), awsSdkBrowserStub()],
	optimizeDeps: {
		rolldownOptions: {
			// Fix Rolldown rc.15 crash: `export * from "./fromTokenFile"` fails when
			// fromTokenFile.js imports `node:fs` in browser-platform mode. Stubbing
			// credential-provider-web-identity and node:fs here lets the optimizer
			// successfully bundle @aws-sdk/credential-providers without crashing.
			plugins: [awsSdkOptimizerFix()],
		},
	},
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
