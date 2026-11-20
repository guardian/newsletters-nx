import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';
import { describe, expect, it } from 'vitest';
import {
	getStandSetupStepId,
	getStandSetupStepPath,
} from './stand-setup-step-path';

describe('Stand setup step paths', () => {
	it('has a distinct, reversible path for every setup step', () => {
		const steps = Object.keys(
			newslettersWorkflowStepLayout['NEWSLETTER_DATA_STAND_REDESIGN']!,
		);
		const paths = steps.map((id) => getStandSetupStepPath(42, id));
		expect(paths).not.toContain(undefined);
		expect(new Set(paths).size).toBe(steps.length);
		for (const [index, path] of paths.entries()) {
			expect(getStandSetupStepId(path!.split('/').pop()!)).toBe(steps[index]);
		}
	});

	it('uses the promotion content step URL', () => {
		expect(getStandSetupStepPath(42, 'promotionContent')).toBe(
			'/drafts/newsletter-data/42/promotion-content',
		);
		expect(getStandSetupStepId('promotion-content')).toBe('promotionContent');
	});

	it('does not resolve unrecognised step IDs or slugs', () => {
		expect(getStandSetupStepId('missing')).toBeUndefined();
		expect(getStandSetupStepPath(42, 'missing')).toBeUndefined();
		expect(getStandSetupStepPath(42, '__proto__')).toBeUndefined();
	});

	it('uses a new-draft path until a list ID exists', () => {
		expect(getStandSetupStepPath(undefined, 'intro')).toBe(
			'/drafts/newsletter-data/new/intro',
		);
	});
});
