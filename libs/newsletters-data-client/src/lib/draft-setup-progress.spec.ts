import { draftSetupSteps, getDraftSetupProgress } from '..';
import { TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS } from '../fixtures/newsletter-fixtures';
import type { DraftNewsletterData } from './schemas/draft-newsletter-data-type';

const completedStepIds = (draft: DraftNewsletterData) =>
	getDraftSetupProgress(draft)
		.steps.filter((step) => step.isComplete)
		.map((step) => step.id);

describe('getDraftSetupProgress', () => {
	it('has one step for each required step of the set-up wizard, in order', () => {
		const progress = getDraftSetupProgress({});

		expect(progress.total).toBe(draftSetupSteps.length);
		expect(progress.steps.map((step) => step.id)).toEqual([
			'nameAndFrequency',
			'productionDetails',
			'promotionDates',
			'targeting',
			'promotionContent',
		]);
	});

	it('has no steps done for an empty draft', () => {
		const progress = getDraftSetupProgress({});

		expect(progress.completed).toBe(0);
		expect(progress.isReadyToLaunch).toBe(false);
	});

	it('only counts a step once all of its required fields are set', () => {
		expect(completedStepIds({ name: 'The Day Today' })).toEqual([]);
		expect(
			completedStepIds({ name: 'The Day Today', frequency: 'Weekly' }),
		).toEqual(['nameAndFrequency']);
	});

	it('does not count a step if one of its fields is invalid', () => {
		expect(completedStepIds({ name: 'The Day Today', frequency: '' })).toEqual(
			[],
		);
	});

	it('counts steps done out of order', () => {
		const draft: DraftNewsletterData = {
			regionFocus: 'UK',
			theme: 'news',
			group: 'News in depth',
		};

		expect(completedStepIds(draft)).toEqual(['targeting']);
		expect(getDraftSetupProgress(draft).completed).toBe(1);
	});

	it('uses the launch defaults, so privateUntilLaunch does not need setting', () => {
		expect(
			completedStepIds({
				launchDate: new Date('2026-12-01'),
				signUpPageDate: new Date('2026-11-20'),
			}),
		).toEqual(['promotionDates']);
	});

	it.each([
		['no steps', {}, 0],
		['one step', { name: 'The Day Today', frequency: 'Weekly' }, 20],
		['every step', TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS, 100],
	] as const)(
		'gives the percentage of steps done for a draft with %s done',
		(_, draft: DraftNewsletterData, expected) => {
			expect(getDraftSetupProgress(draft).percentComplete).toBe(expected);
		},
	);

	it('is ready to launch when every required step is done', () => {
		const progress = getDraftSetupProgress(
			TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS,
		);

		expect(progress.completed).toBe(progress.total);
		expect(progress.isReadyToLaunch).toBe(true);
	});

	it('does not need the optional rendering options for an article-based draft', () => {
		const progress = getDraftSetupProgress({
			...TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS,
			category: 'article-based',
			renderingOptions: undefined,
		});

		expect(progress.isReadyToLaunch).toBe(true);
	});
});
