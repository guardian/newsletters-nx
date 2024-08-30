import {
	StorageRequestFailureReason,
	type SuccessfulStorageResponse,
	type UnsuccessfulStorageResponse,
} from '../storage-response-types';
import type { LayoutStorage } from './LayoutStorage';
import {
	layoutSchema,
	TEST_GROUPS,
	type EditionId,
	type EditionsLayouts,
	type Layout,
} from './types';

export class InMemoryLayoutStorage implements LayoutStorage {
	private data: EditionsLayouts;

	constructor() {
		this.data = TEST_GROUPS;
	}

	create(
		edition: EditionId,
		layout: Layout,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {
		// TO DO - zod parsing of input

		const parseResult = layoutSchema.safeParse(layout);

		if (!parseResult.success) {
			console.warn(parseResult.error.issues);
			return Promise.resolve({
				ok: false,
				message: 'layout in wrong format',
				reason: StorageRequestFailureReason.InvalidDataInput,
			});
		}

		this.data[edition] = parseResult.data;
		return Promise.resolve({
			ok: true,
			data: structuredClone(this.data[edition]),
		});
	}
	read(
		edition: EditionId,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {
		const layout = this.data[edition];
		if (!layout) {
			return Promise.resolve({
				ok: false,
				message: `No layout set for ${edition}`,
				reason: StorageRequestFailureReason.NotFound,
			});
		}
		return Promise.resolve({ ok: true, data: structuredClone(layout) });
	}
	readAll(): Promise<
		SuccessfulStorageResponse<EditionsLayouts> | UnsuccessfulStorageResponse
	> {
		return Promise.resolve({ ok: true, data: structuredClone(this.data) });
	}
	update(
		edition: EditionId,
		layout: Layout,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {
		return this.create(edition, layout);
	}
	delete(
		edition: EditionId,
	): Promise<SuccessfulStorageResponse<Layout> | UnsuccessfulStorageResponse> {
		const layout = this.data[edition];
		if (!layout) {
			return Promise.resolve({
				ok: false,
				message: `No layout set for ${edition}`,
				reason: StorageRequestFailureReason.NotFound,
			});
		}
		delete this.data[edition];
		return Promise.resolve({ ok: true, data: structuredClone(layout) });
	}
}
