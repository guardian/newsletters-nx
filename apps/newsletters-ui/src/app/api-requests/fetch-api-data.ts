import type { ApiResponse } from '@newsletters-nx/newsletters-data-client';

export async function fetchApiData<T>(path: string): Promise<T | undefined> {
	try {
		const response = await fetch(path);
		const data = (await response.json()) as ApiResponse<T>;
		return data.ok ? data.data : undefined;
	} catch (err) {
		console.error(err);
		return undefined;
	}
}

export async function fetchPostApiData<T>(
	path: string,
	body: unknown,
): Promise<T | undefined> {
	try {
		const response = await fetch(path, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});
		const data = (await response.json()) as ApiResponse<T>;
		return data.ok ? data.data : undefined;
	} catch (err) {
		console.error(err);
		return undefined;
	}
}
