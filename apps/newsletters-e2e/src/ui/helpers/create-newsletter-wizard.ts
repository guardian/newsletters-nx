import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { ApiResponse } from '@newsletters-nx/newsletters-data-client';
import type { CurrentStepRouteResponse } from '@newsletters-nx/state-machine';
import type { APIRequestContext, Page } from '@playwright/test';

export default class CreateDraftNewsletterWizard {
	public listId: number | null = null;

	constructor(
		public readonly page: Page,
		public readonly request: APIRequestContext,
	) {}

	public async gotoNextStep() {
		const responsePromise = this.page.waitForResponse((response) => {
			const request = response.request();

			return (
				request.method() === 'POST' &&
				response.url().includes('/api/currentstep')
			);
		});
		await this.page.getByRole('button').filter({ hasText: 'Continue' }).click();
		const response = await responsePromise;

		// TODO: Improve typing here. Check with zod?
		const data = (await response.json()) as unknown as CurrentStepRouteResponse;
		this.listId = data.formData?.listId as number;
	}

	public async getStoredNewsletterData() {
		const response = await this.request.get(`/api/drafts/${this.listId}`);
		const data = (await response.json()) as ApiResponse<DraftNewsletterData>;
		if (!data.ok) {
			throw new Error(
				`Unable to retrieve stored data for newsletter list id ${this.listId}`,
			);
		}
		return data.data;
	}
}
