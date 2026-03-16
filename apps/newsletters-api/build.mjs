import { build } from 'esbuild';
import { cpSync, mkdirSync } from 'fs';

mkdirSync('dist/apps/newsletters-api', { recursive: true });

await build({
	entryPoints: ['apps/newsletters-api/src/main.ts'],
	bundle: true,
	platform: 'node',
	format: 'cjs',
	outfile: 'dist/apps/newsletters-api/index.cjs',
	tsconfig: 'apps/newsletters-api/tsconfig.app.json',
});

cpSync('apps/newsletters-api/src/assets', 'dist/apps/newsletters-api/assets', {
	recursive: true,
});
