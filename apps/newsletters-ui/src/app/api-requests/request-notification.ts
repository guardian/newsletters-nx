import type {
	ApiResponse,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';

export type NotificationType = 'brazeUpdate';
export const requestNotification = async (
	identityName: string,
	notification: NotificationType,
): Promise<ApiResponse<NewsletterData>> => {
	const response = await fetch(`/api/email/${identityName}/${notification}`, {
		method: 'POST',
		headers: {
			accept: 'application/json',
		},
	});

	return (await response.json()) as ApiResponse<NewsletterData>;
};
