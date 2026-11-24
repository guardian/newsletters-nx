import { newslettersWorkflowStepLayout } from '@newsletters-nx/newsletter-workflow';

const stepIds = Object.keys(
	newslettersWorkflowStepLayout['NEWSLETTER_DATA_STAND_REDESIGN']!,
);
const toSlug = (id: string) =>
	id.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

export const getStandSetupStepId = (slug: string) =>
	stepIds.find((id) => toSlug(id) === slug);

export const getStandSetupStepPath = (
	listId: string | number | undefined,
	stepId: string,
) => `/drafts/newsletter-data/${listId ?? 'new'}/${toSlug(stepId)}`;
