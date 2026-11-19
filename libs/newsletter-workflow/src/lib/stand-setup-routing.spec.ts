import type { DraftSetupProgress } from '@newsletters-nx/newsletters-data-client';
import { draftSetupSteps } from '@newsletters-nx/newsletters-data-client';
import {
	getFirstIncompleteSetupStep,
	getStandSetupStepId,
	getStandSetupStepPath,
} from './stand-setup-routing';
import { standRedesignLayout } from './steps/standRedesignNewsletterData';

const progressWith = (
	complete: (id: string) => boolean,
): DraftSetupProgress => {
	const steps = draftSetupSteps.map(({ id, label }) => ({
		id,
		label,
		isComplete: complete(id),
	}));
	const completed = steps.filter((step) => step.isComplete).length;
	return {
		steps,
		completed,
		total: steps.length,
		percentComplete: Math.floor((completed / steps.length) * 100),
		isReadyToLaunch: completed === steps.length,
	};
};

describe('Stand setup step URLs', () => {
	it.each([
		['nameAndFrequency', 'name-and-frequency'],
		['productionDetails', 'production-details'],
		['promotionDates', 'promotion-dates'],
		['promotionContent', 'promotion-content'],
		['cancel', 'cancel'],
	])('derives the slug for %s', (id, slug) => {
		expect(getStandSetupStepPath(7, id)).toBe(
			`/drafts/newsletter-data/7/${slug}`,
		);
		expect(getStandSetupStepId(slug)).toBe(id);
	});

	it.each(Object.keys(standRedesignLayout))(
		'round-trips the registered step %s',
		(id) => {
			const path = getStandSetupStepPath(7, id);
			const slug = path?.split('/').pop() ?? '';
			expect(slug).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
			expect(getStandSetupStepId(slug)).toBe(id);
		},
	);

	it.each([
		'',
		'unknown',
		'__proto__',
		'constructor',
		'nameAndFrequency',
		'name-and-frequency-layout',
	])('rejects unregistered slugs: %s', (slug) =>
		expect(getStandSetupStepId(slug)).toBeUndefined(),
	);

	it.each([
		'unknown',
		'__proto__',
		'dates',
		'signUpPage',
		'nameAndFrequencyLayout',
	])('does not build URLs for unregistered IDs: %s', (id) =>
		expect(getStandSetupStepPath(7, id)).toBeUndefined(),
	);

	it('uses the new-draft path before the first save', () => {
		expect(getStandSetupStepPath(undefined, 'intro')).toBe(
			'/drafts/newsletter-data/new/intro',
		);
	});

	it.each(draftSetupSteps)(
		'uses progress ID $id without translation',
		({ id }) => {
			expect(
				getFirstIncompleteSetupStep(progressWith((stepId) => stepId !== id)),
			).toBe(id);
		},
	);

	it('chooses the earliest gap, not the count of complete steps', () => {
		expect(
			getFirstIncompleteSetupStep(
				progressWith(
					(id) => id !== 'promotionDates' && id !== 'promotionContent',
				),
			),
		).toBe('promotionDates');
	});

	it('defaults to the edit start when every required step is complete', () => {
		expect(getFirstIncompleteSetupStep(progressWith(() => true))).toBe(
			'nameAndFrequency',
		);
	});
});
