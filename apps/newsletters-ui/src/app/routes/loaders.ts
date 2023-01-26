import type { LoaderFunction } from "react-router";
import type { Newsletter } from "@newsletters-nx/newsletters-data-client";

async function getNewsletters(): Promise<Newsletter[]> {
	try {
		const response = await fetch('api/v1/newsletters');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- internal api call
		const data = await response.json();
		return data as Newsletter[];
	} catch (err) {
		console.error(err);
		return [];
	}
}

export const listLoader: LoaderFunction = async (): Promise<Newsletter[]> => {
	const list = await getNewsletters();
	return list;
};

// TO DO - use the /newsletter/:id api route when available
export const detailLoader: LoaderFunction = async ({
	params,
}): Promise<Newsletter | undefined> => {
	const items = await getNewsletters();
	const match = items.find((item) => item.identityName === params.id);
	return match;
};
