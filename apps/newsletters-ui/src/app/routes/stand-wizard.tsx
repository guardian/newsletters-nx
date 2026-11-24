import type { WizardId } from '@newsletters-nx/newsletter-workflow';
import { getStartStepId } from '@newsletters-nx/newsletter-workflow';
import type { LoaderFunctionArgs, RouteObject } from 'react-router-dom';
import { useLoaderData, useLocation } from 'react-router-dom';
import { makeWizardStepRequest } from '../api-requests/make-wizard-step-request';
import {
	StandRedesignWizard,
	WizardFailureAlert,
} from '../components/StandRedesignWizard';
import type { StandWizardStepParams } from '../hooks/useStandWizardStep';

type WizardPageData = StandWizardStepParams | { errorMessage: string };

const loadWizardStep = async (
	wizardId: WizardId,
	{ params, request }: LoaderFunctionArgs,
): Promise<WizardPageData> => {
	const id = params.listId;
	const stepId = getStartStepId(wizardId, id !== undefined);
	if (!stepId) {
		return { errorMessage: 'Wizard has no start step' };
	}
	try {
		const initialStep = await makeWizardStepRequest(
			{ wizardId, id, stepId },
			request.signal,
		);
		return { wizardId, id, initialStep };
	} catch (error) {
		if (request.signal.aborted) {
			throw error;
		}
		console.error('Error loading wizard step:', error);
		return { errorMessage: 'Wizard failed' };
	}
};

const StandWizardPage = () => {
	const data = useLoaderData<WizardPageData>();
	const { pathname } = useLocation();
	if ('errorMessage' in data) {
		return <WizardFailureAlert errorMessage={data.errorMessage} />;
	}
	return <StandRedesignWizard key={pathname} {...data} />;
};

const wizardRoute = (path: string, wizardId: WizardId): RouteObject => ({
	path,
	loader: (args) => loadWizardStep(wizardId, args),
	// Query changes don't select a different draft.
	shouldRevalidate: ({ currentUrl, nextUrl }) =>
		currentUrl.pathname !== nextUrl.pathname,
	element: <StandWizardPage />,
	hydrateFallbackElement: <p>Loading…</p>,
});

export const standWizardRoutes = [
	wizardRoute('newsletter-data/:listId?', 'NEWSLETTER_DATA_STAND_REDESIGN'),
	wizardRoute('newsletter-data-rendering/:listId', 'RENDERING_OPTIONS'),
	wizardRoute('launch-newsletter/:listId?', 'LAUNCH_NEWSLETTER'),
];
