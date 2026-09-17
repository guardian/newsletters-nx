import {
	draftNewsletterDataSchema,
	InMemoryDraftStorage,
	InMemoryNewsletterStorage,
	metaDataSchema,
	newsletterDataSchema,
} from '@newsletters-nx/newsletters-data-client/server';
import type { Express, Request, Response } from 'express';
import { draftStore, newsletterStore } from '../../services/storage';
import {
	makeErrorResponse,
	makeSuccessResponse,
	mapStorageFailureReasonToStatusCode,
} from '../responses';

/**
 * Routes that insert newsletters and drafts directly into storage, bypassing
 * the wizard, so end-to-end tests can set up states the UI cannot reach: a
 * chosen `status`, a known `meta.updatedTimestamp`, or no update date at all.
 *
 * Only registered when `areTestFixturesEnabled()` holds, so they are absent
 * from every deployed environment.
 */

/** `insertVerbatim` only exists on the in-memory implementations. */
const getStores = ():
	| {
			ok: true;
			drafts: InMemoryDraftStorage;
			newsletters: InMemoryNewsletterStorage;
	  }
	| { ok: false } => {
	if (
		draftStore instanceof InMemoryDraftStorage &&
		newsletterStore instanceof InMemoryNewsletterStorage
	) {
		return { ok: true, drafts: draftStore, newsletters: newsletterStore };
	}
	return { ok: false };
};

const WRONG_STORAGE_MESSAGE =
	'Test fixtures require in-memory storage. Set USE_IN_MEMORY_STORAGE=true.';

/** Any newsletter or draft field may be supplied, plus an explicit `meta`. */
const fixtureNewsletterSchema = newsletterDataSchema.extend({
	meta: metaDataSchema.optional(),
});

const fixtureDraftSchema = draftNewsletterDataSchema.extend({
	meta: metaDataSchema.optional(),
});

const sendStorageResult = (
	res: Response,
	result:
		| { ok: true; data: object }
		| { ok: false; message: string; reason?: number },
) => {
	if (result.ok) {
		return res.send(makeSuccessResponse(result.data));
	}
	return res
		.status(mapStorageFailureReasonToStatusCode(result.reason))
		.send(makeErrorResponse(result.message));
};

const parseListIdParam = (req: Request): number | undefined => {
	const idAsNumber = Number(req.params['listId']);
	return Number.isNaN(idAsNumber) ? undefined : idAsNumber;
};

export function registerTestFixtureRoutes(app: Express) {
	app.post('/api/test-fixtures/newsletters', (req, res) => {
		const stores = getStores();
		if (!stores.ok) {
			return res.status(500).send(makeErrorResponse(WRONG_STORAGE_MESSAGE));
		}

		const parsed = fixtureNewsletterSchema.safeParse(req.body);
		if (!parsed.success) {
			return res
				.status(400)
				.send(
					makeErrorResponse(
						`Invalid newsletter fixture: ${parsed.error.issues
							.map((issue) => `${issue.path.join('.')} ${issue.message}`)
							.join('; ')}`,
					),
				);
		}

		return stores.newsletters
			.insertVerbatim(parsed.data)
			.then((result) => sendStorageResult(res, result));
	});

	app.post('/api/test-fixtures/drafts', (req, res) => {
		const stores = getStores();
		if (!stores.ok) {
			return res.status(500).send(makeErrorResponse(WRONG_STORAGE_MESSAGE));
		}

		const parsed = fixtureDraftSchema.safeParse(req.body);
		if (!parsed.success) {
			return res
				.status(400)
				.send(
					makeErrorResponse(
						`Invalid draft fixture: ${parsed.error.issues
							.map((issue) => `${issue.path.join('.')} ${issue.message}`)
							.join('; ')}`,
					),
				);
		}

		return stores.drafts
			.insertVerbatim(parsed.data)
			.then((result) => sendStorageResult(res, result));
	});

	app.delete('/api/test-fixtures/newsletters/:listId', (req, res) => {
		const stores = getStores();
		if (!stores.ok) {
			return res.status(500).send(makeErrorResponse(WRONG_STORAGE_MESSAGE));
		}

		const listId = parseListIdParam(req);
		if (listId === undefined) {
			return res.status(400).send(makeErrorResponse('Non numerical id passed'));
		}

		return stores.newsletters
			.delete(listId)
			.then((result) => sendStorageResult(res, result));
	});

	app.delete('/api/test-fixtures/drafts/:listId', (req, res) => {
		const stores = getStores();
		if (!stores.ok) {
			return res.status(500).send(makeErrorResponse(WRONG_STORAGE_MESSAGE));
		}

		const listId = parseListIdParam(req);
		if (listId === undefined) {
			return res.status(400).send(makeErrorResponse('Non numerical id passed'));
		}

		return stores.drafts
			.deleteItem(listId)
			.then((result) => sendStorageResult(res, result));
	});
}
