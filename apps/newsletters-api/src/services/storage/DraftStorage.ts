import type {
	ApiResponse,
	Newsletter,
} from '@newsletters-nx/newsletters-data-client';

export type Draft = Partial<Newsletter>;
export type DraftWithoutId = Draft & { listId: undefined };
export type DraftWithId = Draft & { listId: number };

export abstract class DraftStorage {
	abstract createDraftNewsletter(
		draft: DraftWithoutId,
	): Promise<ApiResponse<DraftWithId>>;

	abstract getDraftNewsletter(
		listId: number,
	): Promise<ApiResponse<DraftWithId>>;

	abstract modifyDraftNewsletter(
		draft: DraftWithId,
	): Promise<ApiResponse<DraftWithId>>;

	abstract deleteDraftNewsletter(
		listId: number,
	): Promise<ApiResponse<DraftWithId>>;

	abstract listDrafts(): Promise<ApiResponse<DraftWithId[]>>;
}
