import type { z } from 'zod';
import { ZodBoolean, ZodEnum, ZodNumber, ZodString } from 'zod';
import type { WizardFormData } from '@newsletters-nx/state-machine';
import { brazeLayout } from '../steps/brazeLayout';
import { createNewsletterLayout } from '../steps/createNewsletterLayout';
import { descriptionLayout } from '../steps/descriptionLayout';
import { identityNameLayout } from '../steps/identityNameLayout';
import { ophanLayout } from '../steps/ophanLayout';
import { pillarLayout } from '../steps/pillarLayout';

export const getFormSchema = (
	stepId: string,
): z.ZodObject<z.ZodRawShape> | undefined => {
	if (stepId === 'createNewsletter') {
		return createNewsletterLayout.schema;
	}
	if (stepId === 'identityName') {
		return identityNameLayout.schema;
	}
	if (stepId === 'braze') {
		return brazeLayout.schema;
	}
	if (stepId === 'ophan') {
		return ophanLayout.schema;
	}
	if (stepId === 'pillar') {
		return pillarLayout.schema;
	}
	if (stepId === 'description') {
		return descriptionLayout.schema;
	}

	return undefined;
};

export const getFormBlankData = (
	stepId: string,
): WizardFormData | undefined => {
	const schema = getFormSchema(stepId);
	if (!schema) {
		return undefined;
	}

	return Object.keys(schema.shape).reduce<WizardFormData>((formData, key) => {
		const zod = schema.shape[key];

		if (!zod) {
			return formData;
		}

		const mod: WizardFormData = {};

		if (zod instanceof ZodString) {
			mod[key] = '';
		} else if (zod instanceof ZodEnum) {
			const [firstOption] = zod.options as string[];
			mod[key] = firstOption;
		} else if (zod instanceof ZodNumber) {
			mod[key] = 0;
		} else if (zod instanceof ZodBoolean) {
			mod[key] = false;
		}

		return {
			...formData,
			...mod,
		};
	}, {});
};
