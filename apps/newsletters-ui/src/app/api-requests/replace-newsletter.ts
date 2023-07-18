import type {
	ApiResponse,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { replaceUndefinedWithNull } from '@newsletters-nx/newsletters-data-client';

export const replaceNewsletter = async (
	listId: number,
	newsletter: NewsletterData,
): Promise<ApiResponse<NewsletterData>> => {
	const response = await fetch(`/api/newsletters/${listId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(newsletter, replaceUndefinedWithNull),
	});

	return (await response.json()) as ApiResponse<NewsletterData>;
};
