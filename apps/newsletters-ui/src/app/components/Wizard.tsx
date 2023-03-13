import { useCallback, useEffect, useState } from 'react';
import {
	getFormSchema,
	getStepList,
} from '@newsletters-nx/newsletter-workflow';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { getEmptySchemaData } from '@newsletters-nx/state-machine';
import { WIZARDS } from '../types';
import { MarkdownView } from './MarkdownView';
import { StateEditForm } from './StateEditForm';
import { StepNav } from './StepNav';
import { WizardButton } from './WizardButton';

/**
 * Interface for the props passed to the `Wizard` component.
 */
export interface WizardProps {
	wizardId: keyof typeof WIZARDS;
	id?: string;
}

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
		const { createStartStep = '', editStartStep = '' } = WIZARDS[wizardId];
		if (id === undefined) {
			void fetchStep({
				wizardId: wizardId,
				stepId: createStartStep,
			});
		} else {
			void fetchStep({
				wizardId: wizardId,
				id: id,
				stepId: editStartStep,
			});
		}
		setListId(undefined);
	}, [wizardId, id, fetchStep]);

	if (serverData === undefined) {
		return <p>'loading'</p>;
	}

	if (serverErrorMesssage) {
		return (
			<p>
				<b>ERROR:</b>
				<span>{serverErrorMesssage}</span>
			</p>
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
				<p>Please try again: {serverData.errorMessage}</p>
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
