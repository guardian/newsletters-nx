import fs from 'fs';
import path from 'path';
import type { Express, Request, Response } from 'express';
import { static as serveStatic } from 'express';

const routeMap = {
	'/': ['', '/templates'],
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

export async function registerUIServer(app: Express) {
	const pathToStaticFiles = path.join('./dist/apps/newsletters-ui');

	app.use(serveStatic(pathToStaticFiles));

	const handler = await fs.promises.open(
		path.join(pathToStaticFiles, 'index.html'),
	);
	const indexHtml = await handler.readFile();
	await handler.close();

	const serveIndexHtml = (_: Request, res: Response) => {
		res.type('text/html').send(indexHtml);
	};

	Object.entries(routeMap).forEach(([routeName, paths]) => {
		paths.forEach((path) => {
			app.get(`${routeName}${path}`, serveIndexHtml);
		});
	});
}
