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
import { useNavigate } from 'react-router-dom';
import { makeWizardStepRequest } from '../api-requests/make-wizard-step-request';

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
	const [pendingSkip, setPendingSkip] = useState<string>();
	const pendingSubmit = useRef<AbortController>();
	const navigate = useNavigate();

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
			// Once a draft is created, keep its ID even on steps that return no fields.
			const listId = data.formData?.listId ?? serverData.formData?.listId;
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

	const handleButtonClick = ({
		id: buttonId,
		buttonType,
		navigateTo,
	}: WizardButton) => {
		if (navigateTo) {
			void navigate(navigateTo);
			return;
		}
		void sendStepRequest({ buttonId, buttonType });
	};

	const handleStepClick = (stepToSkipToId: string) => {
		if (edits && !currentStepListing?.skippingWillPersistLocalChanges) {
			setPendingSkip(stepToSkipToId);
		} else {
			void sendStepRequest({ stepToSkipToId });
		}
	};

	const handleConfirmSkip = () => {
		if (pendingSkip) {
			void sendStepRequest({ stepToSkipToId: pendingSkip });
			setPendingSkip(undefined);
		}
	};

	return {
		serverData,
		error: requestError ?? serverData,
		formData,
		savedFormData,
		showAllErrors,
		stepperConfig,
		handleFormChange: setEdits,
		handleButtonClick,
		handleStepClick,
		pendingSkip,
		handleCancelSkip: () => setPendingSkip(undefined),
		handleConfirmSkip,
	};
};
