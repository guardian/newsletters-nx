import fs from 'fs';
import path from 'path';
import { fastifyStatic } from '@fastify/static';
import type { FastifyInstance, RouteHandlerMethod } from 'fastify';

export function registerUIServer(app: FastifyInstance) {
	const pathToStaticFiles = path.join('./dist/apps/newsletters-ui');
	// Get fastify to serve the static files
	void app.register(fastifyStatic, {
		root: path.resolve(pathToStaticFiles),
		prefix: '/',
	});

	const handleUiRequest: RouteHandlerMethod = (req, reply) => {
		const pathToServedFile = path.join(pathToStaticFiles, 'index.html');
		const stream = fs.createReadStream(path.resolve(pathToServedFile));
		return reply.type('text/html').send(stream);
	};

	// Route for serving the index.html file
	app.get('/index.html', handleUiRequest);

	// Routes for serving main menu options
	app.get('/drafts/*', handleUiRequest);
	app.get('/drafts', handleUiRequest);
	app.get('/newsletters/*', handleUiRequest);
	app.get('/newsletters', handleUiRequest);
	app.get('/templates/*', handleUiRequest);
	app.get('/templates', handleUiRequest);
	app.get('/thrashers/*', handleUiRequest);
	app.get('/thrashers', handleUiRequest);
}
