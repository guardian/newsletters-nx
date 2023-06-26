import type {
	DraftService,
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

const doModify = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout,
	service?: LaunchService | DraftService,
): Promise<WizardExecutionSuccess | WizardExecutionFailure> => {
	if (!service) {
		return {
			isFailure: true,
			message: 'no draft storage instance',
		};
	}

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
			const storageResponse = await service.draftStorage.update(
				draftNewsletter,
				service.userProfile,
			);
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

export const executeModify: AsyncExecution<DraftService> = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<DraftService>,
	draftService?: DraftService,
) => {
	return doModify(stepData, stepLayout as WizardStepLayout, draftService);
};

export const executeModifyWithinLaunch: AsyncExecution<LaunchService> = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<LaunchService>,
	launchService?: LaunchService,
) => {
	return doModify(stepData, stepLayout as WizardStepLayout, launchService);
};
