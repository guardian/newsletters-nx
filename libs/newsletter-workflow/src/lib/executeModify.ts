import type {
	DraftStorage,
	DraftWithId,
	LaunchService,
} from '@newsletters-nx/newsletters-data-client';
import {
	draftNewsletterDataToFormData,
	formDataToDraftNewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import type {
	AsyncExecution,
	WizardExecutionFailure,
	WizardExecutionSuccess,
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';
import { validateIncomingFormData } from '@newsletters-nx/state-machine';

const isADraftStorage = (
	service: LaunchService | DraftStorage,
): service is DraftStorage => {
	return typeof (service as LaunchService).launchDraft === 'undefined';
};

const doModify = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	service?: LaunchService | DraftStorage,
): Promise<WizardExecutionSuccess | WizardExecutionFailure> => {
	if (!service) {
		return {
			isFailure: true,
			message: 'no draft storage instance',
		};
	}

	const serviceIsADraftInstance = isADraftStorage(service);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- linting bug?
	const ourDraftStorage: DraftStorage = serviceIsADraftInstance
		? service
		: service.draftStorage;

	if (stepData.formData) {
		const { listId } = stepData.formData;
		if (typeof listId !== 'number') {
			return {
				isFailure: true,
				message: 'invalid or missing listId',
			};
		}

		const formValidationError = validateIncomingFormData(
			stepData.currentStepId,
			stepData.formData,
			stepLayout as WizardStepLayout<unknown>,
		);

		if (formValidationError) {
			return {
				isFailure: true,
				message: formValidationError.message,
				details: {
					zodIssues: formValidationError.issues,
				},
			};
		}

		// listId specifically added to draftNewsletter to ensure correct typing
		if (stepData.formData['listId']) {
			const listIdEntry = {
				listId: stepData.formData['listId'] as number,
			};
			const draftNewsletter: DraftWithId = {
				...formDataToDraftNewsletterData(stepData.formData),
				...listIdEntry,
			};
			const storageResponse = await ourDraftStorage.update(draftNewsletter);
			if (storageResponse.ok) {
				return {
					data: draftNewsletterDataToFormData(storageResponse.data),
				};
			}
			return {
				isFailure: true,
				message: storageResponse.message,
			};
		}
	}
	return {
		isFailure: true,
		message: 'missing form data',
	};
};

export const executeModify: AsyncExecution<DraftStorage> = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<DraftStorage>,
	draftStorage?: DraftStorage,
) => {
	return doModify(stepData, stepLayout as WizardStepLayout, draftStorage);
};

export const executeModifyWithinLaunch: AsyncExecution<LaunchService> = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<LaunchService>,
	launchService?: LaunchService,
) => {
	return doModify(stepData, stepLayout as WizardStepLayout, launchService);
};
