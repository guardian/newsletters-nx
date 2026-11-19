import { draftSetupSteps } from '@newsletters-nx/newsletters-data-client';
import { z } from 'zod';
import { standRedesignLayout } from './index';

type StepSchema = { shape: Record<string, z.core.$ZodType> };
const fieldsOf = (schema: StepSchema) =>
	Object.keys(schema.shape).sort().join();
const hasRequiredField = (schema: StepSchema) =>
	Object.values(schema.shape).some(
		(field) => !z.safeParse(field, undefined).success,
	);

describe('draftSetupSteps', () => {
	it('uses the same IDs and fields as the wizard', () => {
		for (const { id, fields } of draftSetupSteps) {
			const schema = standRedesignLayout[id].schema;
			expect(schema && fieldsOf(schema)).toBe([...fields].sort().join());
		}
	});

	it('counts all required steps and excludes optional ones', () => {
		const required = Object.values(standRedesignLayout)
			.map((step) => step.schema)
			.filter((schema) => schema !== undefined)
			.filter(hasRequiredField)
			.map(fieldsOf);
		const counted = draftSetupSteps.map(({ fields }) =>
			[...fields].sort().join(),
		);
		expect(counted.sort()).toEqual(required.sort());
	});
});
