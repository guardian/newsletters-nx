import fs from 'fs';
import path from 'path';
import type {
	Express,
	Request,
	Response,
} from 'express'
import { static as serveStatic } from 'express';


const routeMap = {
	'/': [
		'',
		'/templates',
	],
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
	'/layouts': [
		'',
		'/:id',
		'/edit/:id',
		'/edit-json/:id',
	],
};


export function registerUIServer(app: Express) {
	const pathToStaticFiles = path.join('./dist/apps/newsletters-ui');

	app.use(serveStatic(pathToStaticFiles))

	const serveIndexHtml = async (req: Request, res: Response) => {
		const pathToServedFile = path.join(pathToStaticFiles, 'index.html');
		const handler = await fs.promises.open(pathToServedFile);
		const buffer = await handler.readFile();
		res.type('text/html').send(buffer);
	};

	Object.entries(routeMap).forEach(([routeName, paths]) => {
		paths.forEach(path => {
			app.get(`${routeName}${path}`, serveIndexHtml)
		})
	})
}
