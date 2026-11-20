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

describe('draftSetupSteps', () => {
	it('matches the IDs and fields of the required wizard steps in order', () => {
		const requiredSteps = Object.entries(standRedesignLayout)
			.filter(([, step]) => step.schema && hasRequiredField(step.schema))
			.map(([id]) => id);

		expect(draftSetupSteps.map(({ id }) => id)).toEqual(requiredSteps);
		for (const { id, fields } of draftSetupSteps) {
			const schema = standRedesignLayout[id]?.schema;
			if (!schema) {throw new Error(`No wizard schema for step "${id}"`);}
			expect(fieldsOf(schema)).toBe([...fields].sort().join());
		}
	});

	it('leave out the tags step, which has no required fields', () => {
		expect(hasRequiredField(formSchemas.tags)).toBe(false);
	});
});
