import type { FastifyInstance } from 'fastify';
import { listObjects } from '../../services/s3/utils';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

export function registerS3TestRoutes(app: FastifyInstance) {
	app.get('/api/s3-test/list', async (req, res) => {
		try {
			const output = await listObjects('');

			return makeSuccessResponse(output);
		} catch (err) {
			console.warn(err);
			return res.status(500).send(makeErrorResponse(`listObjects failed`));
		}
	});
}
