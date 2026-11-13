import { withDefaultNewsletterValuesAndDerivedFields } from './draft-to-newsletter';
import { dataCollectionSchema } from './schemas/data-collection-schema';
import type { DraftNewsletterData } from './schemas/draft-newsletter-data-type';

type DataCollectionField = keyof typeof dataCollectionSchema.shape;

export interface DraftSetupStep {
	id: string;
	label: string;
	/** The fields this step of the Stand set-up wizard collects. */
	fields: readonly DataCollectionField[];
}

/**
 * The required steps of the Stand set-up wizard
 * (NEWSLETTER_DATA_STAND_REDESIGN), in the order the wizard shows them.
 *
 * The "Tag Setting" step is left out because none of its fields are
 * required, so a draft is never waiting on it.
 * Rendering options are left out because they are optional, and only
 * apply to article-based newsletters.
 *
 * The fields must match the wizard step schemas in
 * libs/newsletter-workflow - a test there checks this.
 */
export const draftSetupSteps: readonly DraftSetupStep[] = [
	{
		id: 'nameAndFrequency',
		label: 'Name & frequency',
		fields: ['name', 'frequency'],
	},
	{
		id: 'productionDetails',
		label: 'Production details',
		fields: ['category', 'onlineArticle'],
	},
	{
		id: 'promotionDates',
		label: 'Launch/Promotion dates',
		fields: ['launchDate', 'signUpPageDate', 'privateUntilLaunch'],
	},
	{
		id: 'targeting',
		label: 'Targeting',
		fields: ['regionFocus', 'theme', 'group'],
	},
	{
		id: 'promotionContent',
		label: 'Promotion copy and images',
		fields: [
			'signUpHeadline',
			'signUpDescription',
			'signUpEmbedDescription',
			'mailSuccessDescription',
			'highlightCardTitle',
			'illustrationCard',
			'illustrationSquare',
		],
	},
];

export interface DraftSetupProgress {
	steps: Array<Pick<DraftSetupStep, 'id' | 'label'> & { isComplete: boolean }>;
	completed: number;
	total: number;
	/**
	 * `completed` out of `total` as a whole-number percentage,
	 * rounded down so a draft only shows 100 once it is ready to launch.
	 */
	percentComplete: number;
	/** True once every required set-up step is done. */
	isReadyToLaunch: boolean;
}

/**
 * Which of the required set-up steps a draft has done.
 *
 * A step is done when every field it collects is valid for a new
 * newsletter, once the defaults and derived values used at launch
 * have been applied.
 */
export const getDraftSetupProgress = (
	draft: DraftNewsletterData,
): DraftSetupProgress => {
	const draftWithDefaults: Record<string, unknown> =
		withDefaultNewsletterValuesAndDerivedFields(draft);

	const steps = draftSetupSteps.map(({ id, label, fields }) => ({
		id,
		label,
		isComplete: fields.every(
			(field) =>
				dataCollectionSchema.shape[field].safeParse(draftWithDefaults[field])
					.success,
		),
	}));

	const completed = steps.filter((step) => step.isComplete).length;
	const total = steps.length;

	return {
		steps,
		completed,
		total,
		percentComplete: Math.floor((completed / total) * 100),
		isReadyToLaunch: completed === total,
	};
};
