import { Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { getFormBlankData, getFormSchema } from '@newsletters-nx/state-machine';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { MarkdownView } from './MarkdownView';
import { StateEditForm } from './StateEditForm';
import { WizardButton } from './WizardButton';

/**
 * Interface for the props passed to the `Wizard` component.
 */
export interface WizardProps {
	id?: string;
}

const FailureAlert = (props: { errorMessage: string; isFatal?: boolean }) => {
	const { errorMessage, isFatal } = props;
	if (isFatal) {
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
export const Wizard: React.FC<WizardProps> = ({ id }: WizardProps) => {
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
		if (id === undefined) {
			void fetchStep({
				stepId: 'createNewsletter',
			});
		} else {
			void fetchStep({
				id: id,
				stepId: 'editDraftNewsletter',
			});
		}
		setListId(undefined);
	}, [id]);

	if (serverData === undefined) {
		return <p>'loading'</p>;
	}

	if (serverErrorMesssage) {
		return (
			<FailureAlert
				errorMessage={serverErrorMesssage}
				isFatal={serverData.hasFatalError}
			/>
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
				<FailureAlert
					errorMessage={serverData.errorMessage}
					isFatal={serverData.hasFatalError}
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
