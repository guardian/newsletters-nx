import type { WizardId } from '@newsletters-nx/newsletter-workflow';
import {
	getFormSchema,
	getStepperConfig,
} from '@newsletters-nx/newsletter-workflow';
import type { WizardButtonType } from '@newsletters-nx/newsletters-data-client';
import { getEmptySchemaData } from '@newsletters-nx/newsletters-data-client';
import type {
	CurrentStepRouteResponse,
	WizardButton,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBlocker, useLocation, useNavigate } from 'react-router-dom';
import { makeWizardStepRequest } from '../api-requests/make-wizard-step-request';
import { getStandSetupStepPath } from '../stand-setup-step-path';

export interface StandWizardStepParams {
	wizardId: WizardId;
	id?: string;
	initialStep: CurrentStepRouteResponse;
}

type StepRequestError = Pick<
	CurrentStepRouteResponse,
	'errorMessage' | 'errorDetails' | 'hasPersistentError'
>;

type StepAction =
	| { buttonId: string; buttonType: WizardButtonType }
	| { stepToSkipToId: string };

export const useStandWizardStep = ({
	wizardId,
	id,
	initialStep,
}: StandWizardStepParams) => {
	const [serverData, setServerData] = useState(initialStep);
	const [edits, setEdits] = useState<WizardFormData>();
	const [requestError, setRequestError] = useState<StepRequestError>();
	const [showAllErrors, setShowAllErrors] = useState(false);
	const [pendingAction, setPendingAction] = useState<StepAction>();
	const dirty = useRef(false);
	const pendingSubmit = useRef<AbortController>();
	const location = useLocation();
	const navigate = useNavigate();
	const usesStepPaths = wizardId === 'NEWSLETTER_DATA_STAND_REDESIGN';
	const blocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			usesStepPaths &&
			dirty.current &&
			currentLocation.pathname !== nextLocation.pathname,
	);

	useEffect(() => () => pendingSubmit.current?.abort(), []);
	const savedFormData = useMemo(() => {
		const schema = getFormSchema(wizardId, serverData.currentStepId);
		return {
			...(schema && getEmptySchemaData(schema)),
			...serverData.formData,
		};
	}, [wizardId, serverData]);
	const formData = edits ?? savedFormData;

	const sendStepRequest = async (action: StepAction) => {
		if (pendingSubmit.current) {
			return;
		}
		const submit = new AbortController();
		pendingSubmit.current = submit;
		setRequestError(undefined);
		if ('buttonId' in action) {
			setShowAllErrors(true);
		}
		try {
			const data = await makeWizardStepRequest(
				{
					wizardId,
					id,
					stepId: serverData.currentStepId,
					formData,
					...action,
				},
				submit.signal,
			);
			if (data.errorMessage || data.hasPersistentError) {
				// A failed transition must not replace the current step or its form.
				setRequestError(data);
				return;
			}
			dirty.current = false;
			const listId = data.formData?.listId ?? serverData.formData?.listId;
			if (usesStepPaths) {
				const draftId = typeof listId === 'number' ? listId : id;
				const pathname = getStandSetupStepPath(draftId, data.currentStepId);
				if (pathname !== location.pathname) {
					await navigate(
						{ pathname, search: location.search },
						// Replace the `new` entry on first save so Back does not reopen it as a new draft.
						{ replace: !id && draftId !== undefined },
					);
					return;
				}
			}
			// Rendering and launch advance in place; the URL still identifies the draft.
			setServerData({ ...data, formData: { ...data.formData, listId } });
			setEdits(undefined);
			setShowAllErrors(false);
		} catch (error: unknown) {
			if (submit.signal.aborted) {
				return;
			}
			setRequestError({ errorMessage: 'Wizard failed' });
			console.error('Error invoking next step of wizard:', error);
		} finally {
			pendingSubmit.current = undefined;
		}
	};

	const stepperConfig = useMemo(() => getStepperConfig(wizardId), [wizardId]);
	const currentStepListing = stepperConfig.steps.find(
		(step) => step.id === serverData.currentStepId,
	);

	const requestAction = (action: StepAction, discardsEdits: boolean) => {
		if (dirty.current && discardsEdits) {
			setPendingAction(action);
		} else {
			void sendStepRequest(action);
		}
	};

	const handleFormChange = (updatedFormData: WizardFormData) => {
		dirty.current = true;
		setEdits(updatedFormData);
	};

	const handleButtonClick = ({
		id: buttonId,
		buttonType,
		navigateTo,
	}: WizardButton) => {
		if (navigateTo) {
			void navigate(navigateTo);
			return;
		}
		requestAction(
			{ buttonId, buttonType },
			usesStepPaths && (buttonType === 'PREVIOUS' || buttonType === 'CANCEL'),
		);
	};

	const handleStepClick = (stepToSkipToId: string) => {
		requestAction(
			{ stepToSkipToId },
			!currentStepListing?.skippingWillPersistLocalChanges,
		);
	};

	const handleCancelLeave = () => {
		blocker.reset?.();
		setPendingAction(undefined);
	};

	const handleConfirmLeave = () => {
		if (blocker.state === 'blocked') {
			blocker.proceed();
		} else if (pendingAction) {
			void sendStepRequest(pendingAction);
		}
		setPendingAction(undefined);
	};

	return {
		serverData,
		error: requestError ?? serverData,
		formData,
		savedFormData,
		showAllErrors,
		stepperConfig,
		stepLabel: currentStepListing?.label ?? serverData.currentStepId,
		handleFormChange,
		handleButtonClick,
		handleStepClick,
		isConfirmingLeave: blocker.state === 'blocked' || !!pendingAction,
		handleCancelLeave,
		handleConfirmLeave,
	};
};
