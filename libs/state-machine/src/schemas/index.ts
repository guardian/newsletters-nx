import { z } from 'zod';

type FormData = Record<string, string | number | boolean | undefined>;

export const formSchemas = {
	createNewsletter: z
		.object({
			name: z.string(),
		})
		.describe('Input the name for createNewsletter'),
};

// TO DO - define the schemas in the library
export const getFormSchema = (
	stepId: string,
): z.ZodObject<z.ZodRawShape> | undefined => {
	if (stepId === 'createNewsletter') {
		return formSchemas.createNewsletter;
	}

	return undefined;
};

export const getFormBlankData = (stepId: string): FormData | undefined => {
	if (stepId === 'createNewsletter') {
		return {
			name: '',
		};
	}

	return undefined;
};
