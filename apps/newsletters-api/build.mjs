import { build } from 'esbuild';
import { cpSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const WORKSPACE_ROOT = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	'../..',
);
const DIST_ROOT = path.join(WORKSPACE_ROOT, 'dist/apps/newsletters-api');

mkdirSync(DIST_ROOT, {
	recursive: true,
});

await build({
	entryPoints: ['src/main.ts'],
	bundle: true,
	platform: 'node',
	format: 'cjs',
	outfile: path.join(DIST_ROOT, 'index.cjs'),
	tsconfig: 'tsconfig.app.json',
});

cpSync('src/assets', path.join(DIST_ROOT, 'assets'), {
	recursive: true,
});
