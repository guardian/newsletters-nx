import type { Logger, Page } from '@playwright/test';

export default class CreateDraftNewsletterWizard {
	public currentStepData: unknown | null = null;

	constructor(public readonly page: Page) {}

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
		this.currentStepData = await response.json();
	}

	public getListId(): number | undefined {
		return this.currentStepData?.formData.listId;
	}
}
