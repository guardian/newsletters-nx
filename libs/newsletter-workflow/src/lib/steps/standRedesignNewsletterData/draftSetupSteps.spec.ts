import { draftSetupSteps } from '@newsletters-nx/newsletters-data-client';
import { z } from 'zod';
import { formSchemas } from './formSchemas';
import { standRedesignLayout as serverLayout } from './server';
import { standRedesignLayout } from './index';

jest.mock('@newsletters-nx/email-builder/server', () => ({
	sendEmailNotifications: jest.fn(),
}));

// Progress IDs must identify the same steps and fields in the wizard.
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
	it.each(draftSetupSteps)(
		'$id identifies the matching wizard schema',
		({ id, fields }) => {
			const schema = standRedesignLayout[id].schema;
			expect(schema).toBeDefined();
			expect(schema && fieldsOf(schema)).toBe([...fields].sort().join());
		},
	);

	it('uses identical step IDs and order on the client and server', () => {
		expect(Object.keys(serverLayout)).toEqual(Object.keys(standRedesignLayout));
	});

	it('includes every wizard step with a required field', () => {
		const required = new Set(
			wizardStepSchemas.filter(hasRequiredField).map(fieldsOf),
		);

		expect([...countedSteps].sort()).toEqual([...required].sort());
	});

	it('leaves out the tags step, which has no required fields', () => {
		expect(hasRequiredField(formSchemas.tags)).toBe(false);
	});
});
