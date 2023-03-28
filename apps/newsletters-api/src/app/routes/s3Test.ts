import type { FastifyInstance } from 'fastify';
import { getObject, listObjects } from '../../services/s3/utils';
import { s3DraftStorage } from '../../services/s3StorageInstance';
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

	app.get('/api/s3-test/list-drafts', async (req, res) => {
		try {
			const storageReponse = await s3DraftStorage.listDrafts();

			if (!storageReponse.ok) {
				return res.status(500).send(makeErrorResponse(storageReponse.message));
			}

			return makeSuccessResponse(storageReponse.data);
		} catch (err) {
			console.warn(err);
			return res.status(500).send(makeErrorResponse(`listObjects failed`));
		}
	});

	app.get('/api/s3-test/get', async (req, res) => {
		try {
			const output = await getObject('newsletters.local.json');

			const { Body } = output;

			// to do - parse the conents more carefully - might not be valid json
			const content = await Body?.transformToString();
			const json = JSON.parse(content ?? '') as unknown[];

			return makeSuccessResponse(json);
		} catch (err) {
			console.warn(err);
			return res.status(500).send(makeErrorResponse(`listObjects failed`));
		}
	});
}
