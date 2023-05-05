import { Alert, Box, Button, Stack } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type { WizardId } from '@newsletters-nx/newsletter-workflow';
import {
	getFormSchema,
	getStartStepId,
	getStepperConfig,
} from '@newsletters-nx/newsletter-workflow';
import type { WizardButtonType } from '@newsletters-nx/newsletters-data-client';
import { getEmptySchemaData } from '@newsletters-nx/newsletters-data-client';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardButton,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { MarkdownView } from './MarkdownView';
import { StateEditForm } from './StateEditForm';
import { StepNav } from './StepNav';

/**
 * Interface for the props passed to the `Wizard` component.
 */
export interface WizardProps {
	wizardId: WizardId;
	id?: string;
}

const FailureAlert = (props: {
	errorMessage: string;
	isPersistent?: boolean;
}) => {
	const { errorMessage, isPersistent } = props;
	if (isPersistent) {
		return (
			<Alert severity="error">
				Sorry, this wizard has failed: {errorMessage}
			</Alert>
		);
	}
	return <Alert severity="warning">Please try again: {errorMessage}</Alert>;
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
	const [listId, setListId] = useState<number | undefined>(undefined);
	const [serverErrorMessage, setServerErrorMessage] = useState<
		string | undefined
	>();

	const fetchStep = useCallback(
		(body: CurrentStepRouteRequest) => {
			return fetch(`/api/currentstep`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			})
				.then((response) => response.json())
				.then((data: CurrentStepRouteResponse) => {
					const listIdOnData = data.formData?.listId;
					if (typeof listIdOnData === 'number') {
						setListId(listIdOnData);
					}

					setServerData(data);

					const schema = getFormSchema(wizardId, data.currentStepId);
					const blank = schema ? getEmptySchemaData(schema) : undefined;

					const populatedForm = {
						...blank,
						...data.formData,
					};

					setFormData(populatedForm as WizardFormData);
				})
				.catch((error: unknown /* FIXME! */) => {
					setServerErrorMessage('Wizard failed');
					console.error('Error invoking next step of wizard:', error);
				});
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
				isPersistent={serverData.hasPersistentError}
			/>
		);
	}

	const getWizardButton = (
		button: WizardButton,
		onClick: (buttonId: string) => () => void,
		key: string,
	) => {
		const primaryActions: WizardButtonType[] = ['NEXT', 'LAUNCH'];
		const baseStyle = {
			borderRadius: '0px',
		};

		const variant = primaryActions.includes(button.buttonType)
			? 'contained'
			: 'outlined';
		const styling = primaryActions.includes(button.buttonType)
			? { ...baseStyle, bgcolor: '#1C5689' }
			: baseStyle;
		return (
			<Button
				variant={variant}
				sx={styling}
				onClick={() => {
					onClick(button.id)();
				}}
				key={`${key}${button.label}`}
			>
				{button.label}
			</Button>
		);
	};
	const handleButtonClick = (buttonId: string) => () => {
		void fetchStep({
			wizardId: wizardId,
			id: id,
			buttonId: buttonId,
			stepId: serverData.currentStepId || '',
			formData: { ...formData, listId }, // will work for the create and modify workflow, but might break other workflows
		});
	};

	const handleStepClick = (stepToSkipToId: string) => {
		void fetchStep({
			wizardId: wizardId,
			id: id,
			stepId: serverData.currentStepId,
			stepToSkipToId: stepToSkipToId,
			formData: { ...formData, listId },
		});
	};

	const formSchema = getFormSchema(wizardId, serverData.currentStepId);

	return (
		<Box paddingY={2}>
			<StepNav
				currentStepId={serverData.currentStepId}
				stepperConfig={getStepperConfig(wizardId)}
				onEditTrack={typeof id !== 'undefined'}
				handleStepClick={handleStepClick}
				formData={formData}
			/>
			<MarkdownView markdown={serverData.markdownToDisplay ?? ''} />

			{formSchema && formData && (
				<StateEditForm
					formSchema={formSchema}
					formData={formData}
					setFormData={setFormData}
				/>
			)}

			{serverData.errorMessage && (
				<div style={{ paddingBottom: '12px' }}>
					<FailureAlert
						errorMessage={serverData.errorMessage}
						isPersistent={serverData.hasPersistentError}
					/>
				</div>
			)}
			<Stack spacing={2} direction="row">
				{Object.entries(serverData.buttons ?? {}).map(([key, button]) =>
					getWizardButton(button, handleButtonClick, key),
				)}
			</Stack>
		</Box>
	);
};
