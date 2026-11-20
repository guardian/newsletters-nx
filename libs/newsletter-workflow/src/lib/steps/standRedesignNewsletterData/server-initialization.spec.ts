import type { SESClient } from '@aws-sdk/client-ses';
import {
	DraftService,
	InMemoryDraftStorage,
} from '@newsletters-nx/newsletters-data-client/server';
import type { CurrentStepRouteRequest } from '@newsletters-nx/state-machine';
import { handleWizardRequestAndReturnWizardResponse } from '@newsletters-nx/state-machine';
import { standRedesignLayout } from './server';
import { standRedesignLayout as clientLayout } from './index';

jest.mock('@newsletters-nx/email-builder/server', () => ({
	sendEmailNotifications: jest.fn(),
}));

const savedDraft = {
	listId: 123,
	name: 'Down to Earth',
	frequency: 'Weekly',
};

const setup = () => {
	const storage = new InMemoryDraftStorage([savedDraft]);
	const service = new DraftService(
		storage,
		{ name: 'Test User', email: 'test@example.com' },
		{} as SESClient,
		{ testRecipients: [], areEmailNotificationsEnabled: false },
	);
	const read = jest.spyOn(storage, 'read');
	const create = jest.spyOn(storage, 'create');
	const update = jest.spyOn(storage, 'update');
	const deleteItem = jest.spyOn(storage, 'deleteItem');
	const send = (request: Omit<CurrentStepRouteRequest, 'wizardId'>) =>
		handleWizardRequestAndReturnWizardResponse(
			{ wizardId: 'NEWSLETTER_DATA_STAND_REDESIGN', ...request },
			standRedesignLayout,
			service,
		);
	const expectNoWrites = () => {
		expect(create).not.toHaveBeenCalled();
		expect(update).not.toHaveBeenCalled();
		expect(deleteItem).not.toHaveBeenCalled();
	};
	return { send, read, expectNoWrites };
};

describe('step IDs', () => {
	it('are the same in the client and server layouts', () => {
		expect(Object.keys(standRedesignLayout)).toEqual(
			Object.keys(clientLayout),
		);
	});
});

describe.each(Object.keys(standRedesignLayout))('initializing %s', (stepId) => {
	it('loads the saved draft with one read and no writes', async () => {
		const { send, read, expectNoWrites } = setup();

		const response = await send({ stepId, id: '123' });

		expect(response.errorMessage).toBeUndefined();
		expect(response.currentStepId).toBe(stepId);
		expect(response.formData).toMatchObject(savedDraft);
		expect(read).toHaveBeenCalledTimes(1);
		expect(read).toHaveBeenCalledWith(123);
		expectNoWrites();
	});

	it('does not access storage before a draft is saved', async () => {
		const { send, read, expectNoWrites } = setup();

		const response = await send({ stepId });

		expect(response.errorMessage).toBeUndefined();
		expect(response.currentStepId).toBe(stepId);
		expect(response.formData).toEqual({});
		expect(read).not.toHaveBeenCalled();
		expectNoWrites();
	});

	it('reports a missing draft without creating one', async () => {
		const { send, read, expectNoWrites } = setup();

		await expect(send({ stepId, id: '999' })).rejects.toThrow(
			'cannot load draft newsletter with id 999',
		);

		expect(read).toHaveBeenCalledTimes(1);
		expectNoWrites();
	});
});

describe('setup step initialization and skipping', () => {
	it.each(['review', 'finish'])(
		'keeps %s unavailable as a skip destination',
		async (stepToSkipToId) => {
			const { send, expectNoWrites } = setup();

			await expect(
				send({
					stepId: 'nameAndFrequencyLayout',
					stepToSkipToId,
					formData: savedDraft,
				}),
			).rejects.toThrow();
			expectNoWrites();
		},
	);
});
