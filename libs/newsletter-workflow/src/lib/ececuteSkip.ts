import type {DraftStorage} from "@newsletters-nx/newsletters-data-client";
import type {AsyncExecution, WizardFormData, WizardStepData, WizardStepLayout} from "@newsletters-nx/state-machine";

export const executeSkip: AsyncExecution<DraftStorage> = async (
	stepData: WizardStepData,
	stepLayout?: WizardStepLayout<DraftStorage>,
	storageInstance?: DraftStorage,
): Promise<WizardFormData | string> => {
	if (!storageInstance) {
		return 'no storage instance';
	}
	console.log("we're skipping.....");
	return new Promise((resolve, reject) => {
		if (stepData.formData) {
			resolve(stepData.formData);
		}
		reject('something terrible happened');
	});
};
