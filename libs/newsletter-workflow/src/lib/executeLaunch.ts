import type { LaunchService } from '@newsletters-nx/newsletters-data-client';
import type { AsyncExecution } from '@newsletters-nx/state-machine';
import { parseToNumber } from './util';

export const executeLaunch: AsyncExecution<LaunchService> = async (
	stepData,
	wizardStepData,
	launchService,
) => {
	const draftId = parseToNumber(stepData['id']);
	if (draftId === undefined) {
		return `ERROR: invalid id.`;
	}

	if (!launchService) {
		return 'ERROR: no launch service available';
	}

	const response = await launchService.launchDraft(draftId);
	if (!response.ok) {
		return response.message;
	}

	return {
		newNewsletterListId: response.data.listId,
		newNewsletterName: response.data.name,
		newNewsletterIdentityName: response.data.identityName,
	};
};
