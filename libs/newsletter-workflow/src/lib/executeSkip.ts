import type { DraftStorage } from '@newsletters-nx/newsletters-data-client';
import type {
	AsyncExecution,
	WizardFormData,
	WizardStepData,
	WizardStepLayout,
} from '@newsletters-nx/state-machine';

export const executeSkip: AsyncExecution<DraftStorage> = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<DraftStorage>,
	storageInstance?: DraftStorage,
): Promise<WizardFormData | string> => {
	if (!storageInstance) {
		return 'no storage instance';
	}
	return new Promise((resolve, reject) => {
		if (!stepData.formData) {
			reject('missing form data');
		}
		resolve(stepData.formData as WizardFormData);
	});
};