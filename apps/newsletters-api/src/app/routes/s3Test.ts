import type { FastifyInstance } from 'fastify';
import { listObjects } from '../../services/s3/utils';
import { makeErrorResponse, makeSuccessResponse } from '../responses';

export function registerS3TestRoutes(app: FastifyInstance) {
	app.get('/api/s3-test/list', async (req, res) => {
		try {
			const output = await listObjects('');
			const { Contents = [] } = output;
			const listOfKeys = Contents.map((item) => item.Key);

			return makeSuccessResponse(listOfKeys);
		} catch (err) {
			console.warn(err);
			return res.status(500).send(makeErrorResponse(`listObjects failed`));
		}
	});
}
