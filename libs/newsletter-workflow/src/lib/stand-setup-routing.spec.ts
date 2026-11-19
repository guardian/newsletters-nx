import {
	getStandSetupStepId,
	getStandSetupStepPath,
} from './stand-setup-routing';
import { standRedesignLayout } from './steps/standRedesignNewsletterData';

describe('Stand setup step URLs', () => {
	it('round-trips registered steps using kebab-case paths', () => {
		expect(getStandSetupStepPath(7, 'nameAndFrequency')).toBe(
			'/drafts/newsletter-data/7/name-and-frequency',
		);
		for (const id of Object.keys(standRedesignLayout)) {
			const slug = getStandSetupStepPath(7, id)?.split('/').pop() ?? '';
			expect(getStandSetupStepId(slug)).toBe(id);
		}
	});

	it('rejects unknown steps', () => {
		expect(getStandSetupStepId('unknown')).toBeUndefined();
		expect(getStandSetupStepId('__proto__')).toBeUndefined();
		expect(getStandSetupStepPath(7, 'unknown')).toBeUndefined();
	});

	it('uses the new-draft path before the first save', () => {
		expect(getStandSetupStepPath(undefined, 'intro')).toBe(
			'/drafts/newsletter-data/new/intro',
		);
	});
});
