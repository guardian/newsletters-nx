import fs from 'fs';
import path from 'path';
import type { Express, Request, Response } from 'express';
import { Router, static as serveStatic } from 'express';
import { log } from './app/logger';

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
	// Stand launched newsletter page (!switch-legacy).
	'/newsletters': ['/:id', '/:id/details'],
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

export async function createUIRouter() {
	const pathToStaticFiles = resolveStaticFilesPath();

	const indexHtml = await readIndexHtml(
		path.join(pathToStaticFiles, 'index.html'),
	);

	const router = Router();

	if (!indexHtml) {
		log(
			'warn',
			'registerUIServer: index.html not found — UI routes not registered. In production, run `npm run build` first.',
		);
		return router;
	}

	const serveIndexHtml = (_: Request, res: Response) => {
		res.type('text/html').send(indexHtml);
	};

	router.use((req, res, next) => {
		// Prevent UI routes from being included in an iframe
		res.set('X-Frame-Options', 'DENY');
		next();
	});

	Object.entries(routeMap).forEach(([routeName, paths]) => {
		paths.forEach((subPath) => {
			const fullRoute = path.posix.join(routeName, subPath);
			router.get(fullRoute, serveIndexHtml);
		});
	});

	// Intentionally last. Assets are directly served only if not custom matching route exists.
	router.use(serveStatic(pathToStaticFiles));

	return router;
}

export async function registerUIServer(app: Express) {
	const router = await createUIRouter();
	app.use('', router);
}
