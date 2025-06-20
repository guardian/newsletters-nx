import { Express, RequestHandler, static as serveStatic } from 'express';
import fs from 'fs';
import path from 'path';


export function registerUIServer(app: Express) {
	const pathToStaticFiles = path.join('./dist/apps/newsletters-ui');

	app.use(serveStatic(pathToStaticFiles))

	const serveIndexHtml: RequestHandler = async (req, reply) => {
		const pathToServedFile = path.join(pathToStaticFiles, 'index.html');
		const handler = await fs.promises.open(pathToServedFile);
		const buffer = await handler.readFile();
		return reply.type('text/html').send(buffer);
	};

	// Route for serving the index.html file
	app.get('/', serveIndexHtml);

	// Routes for serving main menu options
	app.get('/drafts/*', serveIndexHtml);
	app.get('/drafts', serveIndexHtml);
	app.get('/launched/*', serveIndexHtml);
	app.get('/launched', serveIndexHtml);
	app.get('/templates/*', serveIndexHtml);
	app.get('/templates', serveIndexHtml);
	app.get('/layouts/*', serveIndexHtml);
	app.get('/layouts', serveIndexHtml);
}
