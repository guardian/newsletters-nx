import { draftSetupSteps } from '@newsletters-nx/newsletters-data-client';
import { z } from 'zod';
import { formSchemas } from './formSchemas';
import { standRedesignLayout as serverLayout } from './server';
import { standRedesignLayout } from './index';

jest.mock('@newsletters-nx/email-builder/server', () => ({
	sendEmailNotifications: jest.fn(),
}));

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
	it('matches the IDs and fields of the required wizard steps in order', () => {
		const requiredSteps = Object.entries(standRedesignLayout)
			.filter(([, step]) => step.schema && hasRequiredField(step.schema))
			.map(([id]) => id);

		expect(draftSetupSteps.map(({ id }) => id)).toEqual(requiredSteps);
		for (const { id, fields } of draftSetupSteps) {
			const schema = standRedesignLayout[id]?.schema;
			expect(schema).toBeDefined();
			expect(fieldsOf(schema!)).toBe([...fields].sort().join());
		}
	});

	it('uses the same step IDs in the client and server layouts', () => {
		expect(Object.keys(serverLayout)).toEqual(Object.keys(standRedesignLayout));
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
