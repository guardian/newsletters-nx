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
import {
	makeWizardExecutionFailure,
	makeWizardExecutionSuccess,
	validateIncomingFormData,
} from '@newsletters-nx/state-machine';

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
		return makeWizardExecutionFailure('no draft storage instance');
	}

	const serviceIsADraftInstance = isADraftStorage(service);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- linting bug?
	const ourDraftService: DraftStorage = serviceIsADraftInstance
		? service
		: service.draftStorage;

	if (stepData.formData) {
		const { listId } = stepData.formData;
		if (typeof listId !== 'number') {
			return makeWizardExecutionFailure('invalid or missing listId');
		}

		const formValidationError = validateIncomingFormData(
			stepData.currentStepId,
			stepData.formData,
			stepLayout as WizardStepLayout<unknown>,
		);

		if (formValidationError) {
			return makeWizardExecutionFailure(formValidationError.message, {
				zodIssues: formValidationError.issues,
			});
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
			const storageResponse = await ourDraftService.update(draftNewsletter);
			if (storageResponse.ok) {
				return makeWizardExecutionSuccess(
					draftNewsletterDataToFormData(storageResponse.data),
				);
			}
			return makeWizardExecutionFailure(storageResponse.message);
		}
	}
	return makeWizardExecutionFailure('missing form data');
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
