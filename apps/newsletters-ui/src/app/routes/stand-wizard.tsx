import type { WizardId } from '@newsletters-nx/newsletter-workflow';
import { getStartStepId } from '@newsletters-nx/newsletter-workflow';
import type { LoaderFunctionArgs, RouteObject } from 'react-router-dom';
import { replace, useLoaderData, useLocation } from 'react-router-dom';
import { makeWizardStepRequest } from '../api-requests/make-wizard-step-request';
import {
	StandRedesignWizard,
	WizardFailureAlert,
} from '../components/StandRedesignWizard';
import type { StandWizardStepParams } from '../hooks/useStandWizardStep';
import {
	getStandSetupStepId,
	getStandSetupStepPath,
} from '../stand-setup-step-path';

type WizardPageData = StandWizardStepParams | { errorMessage: string };

const loadWizardStep = async (
	wizardId: WizardId,
	{ params, request }: LoaderFunctionArgs,
): Promise<WizardPageData | Response> => {
	const isSetup = wizardId === 'NEWSLETTER_DATA_STAND_REDESIGN';
	const id = isSetup && params.listId === 'new' ? undefined : params.listId;
	const stepId = params.stepSlug
		? getStandSetupStepId(params.stepSlug)
		: getStartStepId(wizardId, id !== undefined);
	if (!stepId) {
		return { errorMessage: 'Unknown setup step' };
	}
	if (isSetup && !params.stepSlug) {
		return replace(
			getStandSetupStepPath(id, stepId) + new URL(request.url).search,
		);
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
	// Query changes don't select a different draft or step.
	shouldRevalidate: ({ currentUrl, nextUrl }) =>
		currentUrl.pathname !== nextUrl.pathname,
	element: <StandWizardPage />,
	hydrateFallbackElement: <p>Loading…</p>,
});

export const standWizardRoutes = [
	wizardRoute(
		'newsletter-data/:listId?/:stepSlug?',
		'NEWSLETTER_DATA_STAND_REDESIGN',
	),
	wizardRoute('newsletter-data-rendering/:listId', 'RENDERING_OPTIONS'),
	wizardRoute('launch-newsletter/:listId?', 'LAUNCH_NEWSLETTER'),
];
