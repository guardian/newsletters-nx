import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { ApiResponse } from '@newsletters-nx/newsletters-data-client';
import type { CurrentStepRouteResponse } from '@newsletters-nx/state-machine';
import type { APIRequestContext, Locator, Page } from '@playwright/test';

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

	public async fillNameField(value: string) {
		await this.page.getByLabel('Name the newsletter').fill(value);
	}
	public async setFrequencyField(selection: string) {
		await this.page
			.getByLabel('Set the frequency')
			.getByText(selection)
			.check();
	}

	public async setTypeField(selection: string) {
		await this.page
			.getByLabel('Type of newsletter')
			.getByText(selection)
			.check();
	}

	public async setLocationField(selection: string) {
		await this.page
			.getByLabel('Location of newsletter')
			.getByText(selection)
			.check();
	}

	private async fillDateSegment(group: Locator, name: string, value: string) {
		await group.getByRole('spinbutton', { name }).click();
		await this.page.keyboard.type(value);
	}

	public async setLaunchDate(day: string, month: string, year: string) {
		const group = this.page.getByRole('group', { name: 'Enter launch date' });
		await this.fillDateSegment(group, 'day', day);
		await this.fillDateSegment(group, 'month', month);
		await this.fillDateSegment(group, 'year', year);
	}

	public async setSignUpDate(day: string, month: string, year: string) {
		const group = this.page.getByRole('group', {
			name: 'Enter sign up page date',
		});
		await this.fillDateSegment(group, 'day', day);
		await this.fillDateSegment(group, 'month', month);
		await this.fillDateSegment(group, 'year', year);
	}

	public async setRegionFocus(selection: string) {
		await this.page
			.getByRole('radiogroup', { name: 'Region focus' })
			.getByText(selection)
			.check();
	}

	private async selectOption(label: string, option: string) {
		await this.page.getByLabel(label).click();
		await this.page
			.getByRole('listbox')
			.getByRole('option', { name: option })
			.click();
	}

	public async selectPillar(option: string) {
		await this.selectOption('Pillar', option);
	}

	public async selectMmaGroup(option: string) {
		await this.selectOption('Group for MMA page', option);
	}

	public async setSeriesTag(value: string) {
		await this.page
			.getByRole('textbox', { name: 'Add the series tag', exact: true })
			.fill(value);
	}

	public async setSeriesTagDescription(value: string) {
		await this.page
			.getByRole('textbox', {
				name: 'Add the Series tag description',
				exact: true,
			})
			.fill(value);
	}

	public async setCampaignTag(value: string) {
		await this.page
			.getByRole('textbox', { name: 'Campaign tag', exact: true })
			.fill(value);
	}

	public async setCampaignDescription(value: string) {
		await this.page
			.getByRole('textbox', { name: 'Campaign description', exact: true })
			.fill(value);
	}

	public async setHeadline(value: string) {
		await this.page.getByLabel('Headline').fill(value);
	}

	public async setDescription(value: string) {
		await this.page.getByLabel('Description', { exact: true }).fill(value);
	}

	public async setEmbedDescription(value: string) {
		await this.page.getByLabel('Embed description').fill(value);
	}

	public async setSuccessMessage(value: string) {
		await this.page.getByLabel('Success message', { exact: true }).fill(value);
	}

	public async setHighlightCardMessage(value: string) {
		await this.page
			.getByLabel('Highlight card message', { exact: true })
			.fill(value);
	}

	public async setImageUrl(ratio: '5:4' | '1:1', value: string) {
		await this.page
			.getByPlaceholder(`URL of the newsletter graphic ${ratio}`)
			.fill(value);
	}

	public getNavigationStepButton(step: string) {
		return this.page
			.getByRole('navigation', { name: 'Newsletter creation steps' })
			.getByRole('button')
			.filter({ hasText: step });
	}

	public async getAllNavigationStepButtons() {
		return this.page
			.getByRole('navigation', { name: 'Newsletter creation steps' })
			.getByRole('button')
			.all();
	}
}
