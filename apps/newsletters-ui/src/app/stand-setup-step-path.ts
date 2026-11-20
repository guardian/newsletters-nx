// Public URL slugs are explicit so internal step IDs can change independently.
const stepSlugs = {
	cancel: 'cancel',
	intro: 'intro',
	nameAndFrequencyLayout: 'name-and-frequency',
	productionDetails: 'production-details',
	dates: 'dates',
	targeting: 'targeting',
	tags: 'tags',
	signUpPage: 'sign-up-page',
	review: 'review',
	finish: 'finish',
} as const;

export const getStandSetupStepId = (slug: string): string | undefined =>
	Object.entries(stepSlugs).find(([, value]) => value === slug)?.[0];

export const getStandSetupStepPath = (
	listId: string | number | undefined,
	stepId: string,
): string | undefined => {
	const slug = Object.prototype.hasOwnProperty.call(stepSlugs, stepId)
		? stepSlugs[stepId as keyof typeof stepSlugs]
		: undefined;
	return slug === undefined
		? undefined
		: `/drafts/newsletter-data/${listId ?? 'new'}/${slug}`;
};
