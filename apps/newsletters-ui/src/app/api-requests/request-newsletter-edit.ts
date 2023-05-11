import type {
	ApiResponse,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';

export const requestNewsletterEdit = async (
	listId: number,
	modification: Partial<NewsletterData>,
): Promise<ApiResponse<NewsletterData>> => {
	const response = await fetch(`/api/newsletters/${listId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(modification),
	});

	const responseBody = (await response.json()) as ApiResponse<NewsletterData>;
	return responseBody;
};
