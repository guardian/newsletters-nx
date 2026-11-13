import { draftSetupSteps } from '@newsletters-nx/newsletters-data-client';
import { z } from 'zod';
import { formSchemas } from './formSchemas';
import { standRedesignLayout } from './index';

// The draft page counts set-up progress with `draftSetupSteps` from
// newsletters-data-client. These tests fail if the wizard changes
// without that list being updated to match.

type StepSchema = { shape: Record<string, z.core.$ZodType> };

const fieldsOf = (schema: StepSchema) =>
	Object.keys(schema.shape).sort().join();

// A field is required if leaving it out is not valid.
const hasRequiredField = (schema: StepSchema) =>
	Object.values(schema.shape).some(
		(field) => !z.safeParse(field, undefined).success,
	);

const wizardStepSchemas: StepSchema[] = Object.values(standRedesignLayout)
	.map((step) => step.schema)
	.filter((schema) => schema !== undefined);

const countedSteps = draftSetupSteps.map(({ fields }) =>
	[...fields].sort().join(),
);

describe('draftSetupSteps', () => {
	it('each match a step in the Stand set-up wizard', () => {
		const wizardStepFields = wizardStepSchemas.map(fieldsOf);

		for (const fields of countedSteps) {
			expect(wizardStepFields).toContain(fields);
		}
	});

	it('include every wizard step with a required field', () => {
		const required = new Set(
			wizardStepSchemas.filter(hasRequiredField).map(fieldsOf),
		);

		expect([...countedSteps].sort()).toEqual([...required].sort());
	});

	it('leave out the tags step, which has no required fields', () => {
		expect(hasRequiredField(formSchemas.tags)).toBe(false);
	});
});
