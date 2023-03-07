import { useEffect, useState } from 'react';
import { getFormBlankData, getFormSchema } from '@newsletters-nx/state-machine';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { WIZARDS } from '../types';
import { MarkdownView } from './MarkdownView';
import { StateEditForm } from './StateEditForm';
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

	const fetchStep = (body: CurrentStepRouteRequest) => {
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

				const blank = getFormBlankData(data.currentStepId);
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
	};

	useEffect(() => {
		const { createStartStep = '', editStartStep = '' } = WIZARDS[wizardId];
		if (id === undefined) {
			void fetchStep({
				stepId: createStartStep,
			});
		} else {
			void fetchStep({
				id: id,
				stepId: editStartStep,
			});
		}
		setListId(undefined);
	}, [wizardId, id]);

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
			id: id,
			buttonId: buttonId,
			stepId: serverData.currentStepId || '',
			formData: { ...formData, listId }, // will work for the create+modify workflow, but might break other workflows
		});
	};

	const formSchema = getFormSchema(serverData.currentStepId);

	return (
		<>
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
