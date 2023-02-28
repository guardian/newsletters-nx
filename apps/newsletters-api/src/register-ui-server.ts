import fs from 'fs';
import path from 'path';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';

export function registerUIServer(app: FastifyInstance) {
	const pathToStaticFiles = path.join('./dist/apps/newsletters-ui');
	// Get fastify to serve the static files
	void app.register(fastifyStatic, {
		root: path.resolve(pathToStaticFiles),
		prefix: '/',
	});

	// Route for serving the index.html file
	app.get('/index.html', (req, reply) => {
		const pathToServedFile = path.join(pathToStaticFiles, 'index.html');
		const stream = fs.createReadStream(path.resolve(pathToServedFile));
		return reply.type('text/html').send(stream);
	});
}
