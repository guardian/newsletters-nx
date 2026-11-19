import { standRedesignLayout } from './steps/standRedesignNewsletterData';

export type StandSetupStepId = keyof typeof standRedesignLayout;

const stepIds = Object.keys(standRedesignLayout) as StandSetupStepId[];
const toStepSlug = (stepId: StandSetupStepId): string =>
	stepId.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** Resolve only registered steps, never arbitrary IDs supplied in a URL. */
export const getStandSetupStepId = (
	slug: string,
): StandSetupStepId | undefined =>
	stepIds.find((stepId) => toStepSlug(stepId) === slug);

export const getStandSetupStepPath = (
	listId: string | number | undefined,
	stepId: string,
): string | undefined => {
	const knownStepId = stepIds.find((id) => id === stepId);
	if (!knownStepId) {
		return undefined;
	}
	return `/drafts/newsletter-data/${listId ?? 'new'}/${toStepSlug(knownStepId)}`;
};
