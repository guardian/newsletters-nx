import { draftSetupSteps } from '@newsletters-nx/newsletters-data-client';
import { z } from 'zod';
import { formSchemas } from './formSchemas';
import { standRedesignLayout } from './index';

// The draft page counts set-up progress with `draftSetupSteps` from
// newsletters-data-client. These tests fail if the wizard changes
// without that list being updated to match.

type StepSchema = { shape: Record<string, z.core.$ZodType> };

// A field is required if leaving it out is not valid.
const hasRequiredField = (schema: StepSchema) =>
	Object.values(schema.shape).some(
		(field) => !z.safeParse(field, undefined).success,
	);

describe('draftSetupSteps', () => {
	it('matches the IDs and fields of the required wizard steps in order', () => {
		const requiredSteps = Object.entries(standRedesignLayout).flatMap(
			([id, { schema }]) =>
				schema && hasRequiredField(schema)
					? [{ id, fields: Object.keys(schema.shape).sort() }]
					: [],
		);
		const countedSteps = draftSetupSteps.map(({ id, fields }) => ({
			id,
			fields: [...fields].sort(),
		}));

		expect(countedSteps).toEqual(requiredSteps);
	});

	it('leave out the tags step, which has no required fields', () => {
		expect(hasRequiredField(formSchemas.tags)).toBe(false);
	});
});
