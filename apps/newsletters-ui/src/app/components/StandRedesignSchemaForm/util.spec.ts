import { z } from 'zod';
import { getModification } from './util';

describe('getModification', () => {
	it('updates a ZodEmail field (regression for #740 - stand design contact email not updating)', () => {
		const field = {
			key: 'contactEmail',
			value: 'old@example.com',
			zod: z.email().optional(),
		};

		expect(getModification('new@example.com', field)).toEqual({
			contactEmail: 'new@example.com',
		});
	});
});
