import type { z } from 'zod';
import type { WizardFormData } from '@newsletters-nx/state-machine';
import { getEmptySchemaData } from '@newsletters-nx/state-machine';
import { newslettersWorkflowStepLayout } from './steps';

export const getFormSchema = (
	stepId: string,
): z.ZodObject<z.ZodRawShape> | undefined => {
	return newslettersWorkflowStepLayout[stepId]
		? newslettersWorkflowStepLayout[stepId]?.schema
		: undefined;
};

export const getFormBlankData = (
	stepId: string,
): WizardFormData | undefined => {
	const schema = getFormSchema(stepId);
	if (!schema) {
		return undefined;
	}

	return getEmptySchemaData(schema);
};
