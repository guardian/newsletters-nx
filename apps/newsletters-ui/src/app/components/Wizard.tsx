import { Alert, Box, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type { WizardId } from '@newsletters-nx/newsletter-workflow';
import {
	getFormSchema,
	getStartStepId,
	getStepperConfig,
} from '@newsletters-nx/newsletter-workflow';
import { getEmptySchemaData } from '@newsletters-nx/newsletters-data-client';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { makeWizardStepRequest } from '../api-requests/make-wizard-step-request';
import { MarkdownView } from './MarkdownView';
import { SkipConfirmationDialog } from './SkipConfirmationDialog';
import { StateEditForm } from './StateEditForm';
import { StepNav } from './StepNav';
import { WizardActionButton } from './WizardActionButton';
import { ZodIssuesReport } from './ZodIssuesReport';

/**
 * Interface for the props passed to the `Wizard` component.
 */
export interface WizardProps {
	wizardId: WizardId;
	id?: string;
}

const FailureAlert = (props: {
	errorMessage: string;
	errorDetails?: CurrentStepRouteResponse['errorDetails'];
	isPersistent?: boolean;
}) => {
	const { errorMessage, isPersistent, errorDetails } = props;

	if (isPersistent) {
		return (
			<Alert severity="error">
				Sorry, this wizard has failed: {errorMessage}
			</Alert>
		);
	}
	return (
		<Alert severity="warning">
			{' '}
			Please try again: {errorMessage}
			{errorDetails?.zodIssues && (
				<ZodIssuesReport issues={errorDetails.zodIssues} />
			)}
			{errorDetails?.problemList && (
				<Stack spacing={1} component={'ul'}>
					{errorDetails.problemList.map((problem, index) => (
						<Typography key={index} component={'li'}>
							{problem}
						</Typography>
					))}
				</Stack>
			)}
		</Alert>
	);
};

/**
 * Component that displays a single step in a wizard, including markdown content and buttons.
 */
export const Wizard: React.FC<WizardProps> = ({
	wizardId,
	id,
}: WizardProps) => {
	const [serverData, setServerData] = useState<
		CurrentStepRouteResponse | undefined
	>(undefined);
	const [formData, setFormData] = useState<WizardFormData | undefined>(
		undefined,
	);
	const [currentStepHasBeenChanged, setCurrentStepHasBeenChanged] =
		useState(false);
	const [showSkipModalFor, setShowSkipModalFor] = useState<string | undefined>(
		undefined,
	);
	const [listId, setListId] = useState<number | undefined>(undefined);
	const [serverErrorMessage, setServerErrorMessage] = useState<
		string | undefined
	>();

	const fetchStep = useCallback(
		async (body: CurrentStepRouteRequest) => {
			try {
				const data = await makeWizardStepRequest(body);
				const listIdOnData = data.formData?.listId;
				if (typeof listIdOnData === 'number') {
					setListId(listIdOnData);
				}

				setServerData(data);
				const schema = getFormSchema(wizardId, data.currentStepId);
				const blank = schema ? getEmptySchemaData(schema) : undefined;

				setFormData({
					...blank,
					...data.formData,
				});
				setCurrentStepHasBeenChanged(false);
				setShowSkipModalFor(undefined);
			} catch (error: unknown /* FIXME! */) {
				setServerErrorMessage('Wizard failed');
				console.error('Error invoking next step of wizard:', error);
			}
		},
		[wizardId],
	);

	useEffect(() => {
		if (id === undefined) {
			void fetchStep({
				wizardId: wizardId,
				stepId: getStartStepId(wizardId, false) ?? '',
			});
		} else {
			void fetchStep({
				wizardId: wizardId,
				id: id,
				stepId: getStartStepId(wizardId, true) ?? '',
			});
		}
		setListId(undefined);
	}, [wizardId, id, fetchStep]);

	if (serverData === undefined) {
		return <p>'loading'</p>;
	}

	if (serverErrorMessage) {
		return (
			<FailureAlert
				errorMessage={serverErrorMessage}
				errorDetails={serverData.errorDetails}
				isPersistent={serverData.hasPersistentError}
			/>
		);
	}

	const formSchema = getFormSchema(wizardId, serverData.currentStepId);
	const stepperConfig = getStepperConfig(wizardId);
	const currentStepListing = stepperConfig.steps.find(
		(step) => step.id === serverData.currentStepId,
	);

	const handleFormChange = (updatedLocalState: WizardFormData): void => {
		if (showSkipModalFor) {
			return;
		}
		setCurrentStepHasBeenChanged(true);
		return setFormData(updatedLocalState);
	};

	const handleButtonClick = (buttonId: string) => () => {
		if (showSkipModalFor) {
			return;
		}
		void fetchStep({
			wizardId: wizardId,
			id: id,
			buttonId: buttonId,
			stepId: serverData.currentStepId || '',
			formData: { ...formData, listId }, // will work for the create and modify workflow, but might break other workflows
		});
	};

	const handleStepClick = (stepToSkipToId: string) => {
		if (showSkipModalFor) {
			return;
		}

		// If the user has changed the local data on the current step
		// and skipping will cause those changes to be discarded,
		// show the confirmation modal before fetching the new step.
		if (
			currentStepHasBeenChanged &&
			!currentStepListing?.skippingWillPersistLocalChanges
		) {
			setShowSkipModalFor(stepToSkipToId);
			return;
		}
		return void fetchStep({
			wizardId: wizardId,
			id: id,
			stepId: serverData.currentStepId,
			stepToSkipToId: stepToSkipToId,
			formData: { ...formData, listId },
		});
	};

	const handleCancelSkip = () => {
		setShowSkipModalFor(undefined);
	};

	const handleConfirmSkip = () => {
		void fetchStep({
			wizardId: wizardId,
			id: id,
			stepId: serverData.currentStepId,
			stepToSkipToId: showSkipModalFor,
			formData: { ...formData, listId },
		});
	};

	return (
		<Box paddingY={2}>
			<StepNav
				currentStepId={serverData.currentStepId}
				stepperConfig={stepperConfig}
				onEditTrack={typeof id !== 'undefined'}
				handleStepClick={handleStepClick}
				formData={formData}
			/>
			<MarkdownView markdown={serverData.markdownToDisplay ?? ''} />

			{formSchema && formData && (
				<StateEditForm
					formSchema={formSchema}
					formData={formData}
					setFormData={handleFormChange}
					maxOptionsForRadioButtons={5}
				/>
			)}

			{serverData.errorMessage && (
				<Box paddingBottom={2}>
					<FailureAlert
						errorMessage={serverData.errorMessage}
						errorDetails={serverData.errorDetails}
						isPersistent={serverData.hasPersistentError}
					/>
				</Box>
			)}
			<Stack spacing={2} direction="row">
				{Object.entries(serverData.buttons ?? {}).map(([key, button]) => (
					<WizardActionButton
						key={key}
						button={button}
						onClick={handleButtonClick}
					/>
				))}
			</Stack>

			<SkipConfirmationDialog
				currentStepId={serverData.currentStepId}
				targetStepId={showSkipModalFor}
				handleCancelSkip={handleCancelSkip}
				handleConfirmSkip={handleConfirmSkip}
				stepperConfig={stepperConfig}
			/>
		</Box>
	);
};
