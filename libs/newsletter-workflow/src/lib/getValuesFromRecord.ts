import type { WizardFormData } from '@newsletters-nx/state-machine';

export const getStringValuesFromRecord = (
	record: WizardFormData,
	keys: string[],
): string[] => {
	return keys.map((key) => {
		const value = record[key];
		if (typeof value === 'undefined' || value == null) {
			return '';
		}
		return value.toString();
	});
};
