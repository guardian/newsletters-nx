import { useEffect, useState } from 'react';
import { getFormBlankData, getFormSchema } from '@newsletters-nx/state-machine';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	WizardFormData,
} from '@newsletters-nx/state-machine';
import { MarkdownView } from './MarkdownView';
import type { FieldDef, FieldValue } from './SchemaForm';
import { getModification, SchemaForm } from './SchemaForm';
import { WizardButton } from './WizardButton';

/**
 * Interface for the props passed to the `Wizard` component.
 */
export interface WizardProps {
	id?: string;
}

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
		return fetch(`/api/v1/currentstep`, {
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

	const changeFormData = (value: FieldValue, field: FieldDef) => {
		const mod = getModification(value, field);
		const revisedData = {
			...formData,
			...mod,
		};

		setFormData(revisedData);
	};

	return (
		<>
			<MarkdownView markdown={serverData.markdownToDisplay ?? ''} />

			{formSchema && formData && (
				<fieldset>
					<legend>{formSchema.description}</legend>
					<SchemaForm
						schema={formSchema}
						data={formData}
						validationWarnings={{}}
						changeValue={changeFormData}
					/>
				</fieldset>
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
