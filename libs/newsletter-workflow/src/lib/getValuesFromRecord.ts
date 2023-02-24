import { WizardFormData } from '@newsletters-nx/state-machine';

export const getStringValuesFromRecord = (
	record: WizardFormData,
	keys: string[],
): string[] => {
	return keys.map((key) => {
		const value = record[key];
		if (typeof value === 'undefined') {
			return '';
		}
		return value.toString();
	});
};
