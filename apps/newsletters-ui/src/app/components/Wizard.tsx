import { Alert } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import type { WizardId } from '@newsletters-nx/newsletter-workflow';
import {
	getFormSchema,
	getStartStepId,
	getStepList,
} from '@newsletters-nx/newsletter-workflow';
import { getEmptySchemaData } from '@newsletters-nx/state-machine';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { MarkdownView } from './MarkdownView';
import { StateEditForm } from './StateEditForm';
import { StepNav } from './StepNav';
import { WizardButton } from './WizardButton';

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
	const [serverErrorMesssage, setServerErrorMessage] = useState<
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
					console.table(data);
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

	if (serverErrorMesssage) {
		return (
			<FailureAlert
				errorMessage={serverErrorMesssage}
				isPersistent={serverData.hasPersistentError}
			/>
		);
	}

	const handleButtonClick = (buttonId: string) => () => {
		void fetchStep({
			wizardId: wizardId,
			id: id,
			buttonId: buttonId,
			stepId: serverData.currentStepId || '',
			formData: { ...formData, listId }, // will work for the create+modify workflow, but might break other workflows
		});
	};

	const formSchema = getFormSchema(wizardId, serverData.currentStepId);

	return (
		<>
			<StepNav
				currentStepId={serverData.currentStepId}
				stepList={getStepList(wizardId)}
				onEditTrack={typeof id !== 'undefined'}
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
				<FailureAlert
					errorMessage={serverData.errorMessage}
					isPersistent={serverData.hasPersistentError}
				/>
			)}
			{Object.entries(serverData.buttons ?? {}).map(([key, button]) => (
				<WizardButton
					id={button.id}
					label={button.label}
					buttonType={button.buttonType}
					onClick={() => {
						handleButtonClick(button.id)();
					}}
					key={`${key}${button.label}`}
				/>
			))}
		</>
	);
};
