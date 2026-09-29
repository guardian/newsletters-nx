import fs from 'fs';
import path from 'path';
import type { Express, Request, Response } from 'express';
import { static as serveStatic } from 'express';

const routeMap = {
	'/': [''],
	'/templates': [''],
	'/all': [''],
	'/launched': [
		'',
		'/:id',
		'/edit/:id',
		'/rendering-options/:id',
		'/edit-json/:id',
		'/preview/:id',
	],
	'/drafts': [
		'',
		'/:id',
		'/newsletter-data/:listId',
		'/newsletter-data-rendering/:listId',
		'/newsletter-data-rendering',
		'/newsletter-data',
		'/launch-newsletter/:listId',
		'/launch-newsletter',
	],
	'/layouts': ['', '/:id', '/edit/:id', '/edit-json/:id'],
};

const readIndexHtml = async (filePath: string): Promise<Buffer | null> => {
	try {
		const handler = await fs.promises.open(filePath);
		const content = await handler.readFile();
		await handler.close();
		return content;
	} catch {
		return null;
	}
};

function resolveStaticFilesPath(): string {
	const candidates = [
		path.resolve(process.cwd(), 'dist/apps/newsletters-ui'),
		path.resolve(process.cwd(), '../../dist/apps/newsletters-ui'),
		path.resolve(__dirname, '../../../dist/apps/newsletters-ui'),
		path.resolve(__dirname, '../../newsletters-ui'),
	];

	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) {
			return candidate;
		}
	}

	return path.resolve(process.cwd(), 'dist/apps/newsletters-ui');
}

export async function registerUIServer(app: Express) {
	const pathToStaticFiles = resolveStaticFilesPath();

	app.use(serveStatic(pathToStaticFiles));

	const indexHtml = await readIndexHtml(
		path.join(pathToStaticFiles, 'index.html'),
	);

	if (!indexHtml) {
		console.warn(
			'registerUIServer: index.html not found — UI routes not registered. In production, run `npm run build` first.',
		);
		return;
	}

	const serveIndexHtml = (_: Request, res: Response) => {
		res.type('text/html').send(indexHtml);
	};

	Object.entries(routeMap).forEach(([routeName, paths]) => {
		paths.forEach((subPath) => {
			const fullRoute = path.posix.join(routeName, subPath);
			app.get(fullRoute, serveIndexHtml);
		});
	});
}
