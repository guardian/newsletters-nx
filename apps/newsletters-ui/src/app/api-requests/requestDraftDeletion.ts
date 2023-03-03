import type {
	ApiResponse,
	DraftWithId,
} from '@newsletters-nx/newsletters-data-client';

export const requestDraftDeletion = async (
	listId: number,
): Promise<
	{ ok: true; deletedDraft: DraftWithId } | { ok: false; message: string }
> => {
	try {
		const response = await fetch(`/api/drafts/${listId}`, {
			method: 'DELETE',
		});
		const payload = (await response.json()) as ApiResponse<DraftWithId>;

		if (payload.ok) {
			return {
				ok: true,
				deletedDraft: payload.data,
			};
		}

		return {
			ok: false,
			message: payload.message ?? 'UNKNOWN DELETE ERROR',
		};
	} catch (err) {
		console.warn('ERROR');
		console.log(err);
		return {
			ok: false,
			message: 'DELETE REQUEST FAILED',
		};
	}
};
