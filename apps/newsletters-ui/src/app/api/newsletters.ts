import type {
	ApiResponse,
	Newsletter,
} from '@newsletters-nx/newsletters-data-client';

export async function getNewsletters(): Promise<Newsletter[]> {
	try {
		const response = await fetch('api/v1/newsletters');
		const data = (await response.json()) as ApiResponse<Newsletter[]>;

		return data.ok ? data.data : []; // TODO: handle non 2xx responses
	} catch (err) {
		console.error(err);
		return [];
	}
}

export async function getNewsletter(
	id: string,
): Promise<Newsletter | undefined> {
	try {
		const response = await fetch(`api/v1/newsletters/${id}`);
		const data = (await response.json()) as ApiResponse<Newsletter>;
		return data.ok ? data.data : undefined; // TODO: handle non 2xx responses
	} catch (err) {
		console.error(err);
		return undefined;
	}
}
