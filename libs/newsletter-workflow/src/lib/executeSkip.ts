import { draftNewsletterDataToFormData } from '@newsletters-nx/newsletters-data-client';
import type { DraftService } from '@newsletters-nx/newsletters-data-client';
import type {
	AsyncExecution,
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';

const getListId = (stepData: WizardStepData): number | undefined => {
	if (stepData.id) {
		return Number(stepData.id);
	}
	const listIdOnForm = stepData.formData?.['listId'];
	if (listIdOnForm) {
		if (typeof listIdOnForm === 'number') {
			return listIdOnForm;
		}
		if (typeof listIdOnForm === 'string') {
			return Number(listIdOnForm);
		}
	}
	return undefined;
};

export const executeSkip: AsyncExecution<DraftService> = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<DraftService>,
	draftService?: DraftService,
) => {
	if (!draftService) {
		return { isFailure: true, message: 'no draft service instance' };
	}

	const listId = getListId(stepData);
	if (typeof listId === 'undefined') {
		return {
			isFailure: true,
			message: 'incoming data did not include the listId',
		};
	}
	const storageResponse = await draftService.draftStorage.read(listId);

	if (!storageResponse.ok) {
		return {
			isFailure: true,
			message: `failed to fetch data for draft #${listId}`,
		};
	}

	return { data: draftNewsletterDataToFormData(storageResponse.data) };
};
