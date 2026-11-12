import type { SESClient } from '@aws-sdk/client-ses';
import {
	DraftService,
	InMemoryDraftStorage,
} from '@newsletters-nx/newsletters-data-client/server';
import type { CurrentStepRouteRequest } from '@newsletters-nx/state-machine';
import { handleWizardRequestAndReturnWizardResponse } from '@newsletters-nx/state-machine';
import { standRedesignLayout } from './server';

jest.mock('@newsletters-nx/email-builder/server', () => ({
	sendEmailNotifications: jest.fn(),
}));

const setup = () => {
	const draftStorage = new InMemoryDraftStorage();
	const draftService = new DraftService(
		draftStorage,
		{ name: 'Test User', email: 'test@example.com' },
		{} as SESClient,
		{ testRecipients: [], areEmailNotificationsEnabled: false },
	);
	const send = (request: Omit<CurrentStepRouteRequest, 'wizardId'>) =>
		handleWizardRequestAndReturnWizardResponse(
			{ wizardId: 'NEWSLETTER_DATA_STAND_REDESIGN', ...request },
			standRedesignLayout,
			draftService,
		);
	const countDrafts = async () => {
		const response = await draftStorage.readAll();
		return response.data.length;
	};
	return { send, countDrafts };
};

describe('standRedesignLayout draft creation', () => {
	it('does not create a draft when continuing from the intro step', async () => {
		const { send, countDrafts } = setup();

		const response = await send({
			stepId: 'intro',
			buttonId: 'next',
			buttonType: 'NEXT',
			formData: {},
		});

		expect(response.errorMessage).toBeUndefined();
		expect(response.currentStepId).toBe('nameAndFrequencyLayout');
		expect(response.formData?.listId).toBeUndefined();
		expect(await countDrafts()).toBe(0);
	});

	it('does not create a draft when skipping between steps before any data is saved', async () => {
		const { send, countDrafts } = setup();

		const fromIntro = await send({
			stepId: 'intro',
			stepToSkipToId: 'targeting',
			formData: {},
		});
		expect(fromIntro.errorMessage).toBeUndefined();
		expect(fromIntro.currentStepId).toBe('targeting');

		const fromTargeting = await send({
			stepId: 'targeting',
			stepToSkipToId: 'productionDetails',
			formData: {},
		});
		expect(fromTargeting.errorMessage).toBeUndefined();
		expect(fromTargeting.currentStepId).toBe('productionDetails');

		const back = await send({
			stepId: 'productionDetails',
			buttonId: 'back',
			buttonType: 'PREVIOUS',
			formData: {},
		});
		expect(back.errorMessage).toBeUndefined();
		expect(back.currentStepId).toBe('nameAndFrequencyLayout');

		expect(await countDrafts()).toBe(0);
	});

	it('does not create a draft when the first saved step fails validation', async () => {
		const { send, countDrafts } = setup();

		const response = await send({
			stepId: 'nameAndFrequencyLayout',
			buttonId: 'next',
			buttonType: 'NEXT',
			formData: {},
		});

		expect(response.errorMessage).toBeDefined();
		expect(response.currentStepId).toBe('nameAndFrequencyLayout');
		expect(await countDrafts()).toBe(0);
	});

	it('creates the draft when the editor first saves a step, then modifies it on later saves', async () => {
		const { send, countDrafts } = setup();

		const nameStep = await send({
			stepId: 'nameAndFrequencyLayout',
			buttonId: 'next',
			buttonType: 'NEXT',
			formData: { name: 'Down to Earth', frequency: 'Weekly' },
		});

		expect(nameStep.errorMessage).toBeUndefined();
		expect(nameStep.currentStepId).toBe('productionDetails');
		const listId = nameStep.formData?.listId;
		expect(typeof listId).toBe('number');
		expect(nameStep.formData?.name).toBe('Down to Earth');
		expect(await countDrafts()).toBe(1);

		const productionStep = await send({
			stepId: 'productionDetails',
			buttonId: 'finish',
			buttonType: 'NEXT',
			formData: {
				...nameStep.formData,
				category: 'article-based',
				onlineArticle: 'Email only',
			},
		});

		expect(productionStep.errorMessage).toBeUndefined();
		expect(productionStep.currentStepId).toBe('dates');
		expect(productionStep.formData?.listId).toBe(listId);
		expect(productionStep.formData?.name).toBe('Down to Earth');
		expect(productionStep.formData?.category).toBe('article-based');
		expect(await countDrafts()).toBe(1);
	});

	it('creates the draft from whichever step is saved first', async () => {
		const { send, countDrafts } = setup();

		const response = await send({
			stepId: 'targeting',
			buttonId: 'finish',
			buttonType: 'NEXT',
			formData: { regionFocus: 'UK', theme: 'sport', group: 'Opinion' },
		});

		expect(response.errorMessage).toBeUndefined();
		expect(response.currentStepId).toBe('tags');
		expect(typeof response.formData?.listId).toBe('number');
		expect(response.formData?.regionFocus).toBe('UK');
		expect(await countDrafts()).toBe(1);
	});

	it('loads the stored draft when skipping once the draft exists', async () => {
		const { send, countDrafts } = setup();

		const created = await send({
			stepId: 'nameAndFrequencyLayout',
			buttonId: 'next',
			buttonType: 'NEXT',
			formData: { name: 'Down to Earth', frequency: 'Weekly' },
		});
		const listId = created.formData?.listId;

		const skipped = await send({
			stepId: 'productionDetails',
			stepToSkipToId: 'intro',
			formData: { listId },
		});
		expect(skipped.errorMessage).toBeUndefined();
		expect(skipped.formData?.name).toBe('Down to Earth');

		const continued = await send({
			stepId: 'intro',
			buttonId: 'next',
			buttonType: 'NEXT',
			formData: skipped.formData,
		});
		expect(continued.errorMessage).toBeUndefined();
		expect(continued.formData?.listId).toBe(listId);
		expect(continued.formData?.name).toBe('Down to Earth');
		expect(await countDrafts()).toBe(1);
	});
});
