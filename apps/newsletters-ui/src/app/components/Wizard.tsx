import { useEffect, useState } from 'react';
import { z } from 'zod';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
	FormData,
} from '@newsletters-nx/state-machine';
import { MarkdownView } from './MarkdownView';
import type { FieldDef, FieldValue} from './SchemaForm';
import { getModification , SchemaForm } from './SchemaForm';
import { WizardButton } from './WizardButton';

/**
 * Interface for the props passed to the `Wizard` component.
 */
export interface WizardProps {
	newsletterId?: string;
}

// TO DO - define the schemas in the library
const getFormSchema = (
	stepId: string,
): z.ZodObject<z.ZodRawShape> | undefined => {
	if (stepId === 'createNewsletter') {
		return z
			.object({
				name: z.string(),
			})
			.describe('I am a schema');
	}

	return undefined;
};

// TO DO - generate the blank data using the schema
const getFormBlankData = (
	stepId: string,
): FormData | undefined => {
	if (stepId === 'createNewsletter') {
		return {
			name: '',
		};
	}

	return undefined;
};

/**
 * Component that displays a single step in a wizard, including markdown content and buttons.
 */
export const Wizard: React.FC<WizardProps> = () => {
	const [serverData, setServerData] = useState<
		CurrentStepRouteResponse | undefined
	>(undefined);
	const [formData, setFormData] = useState<FormData | undefined>(
		undefined,
	);
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
				setServerData(data);
				setFormData(getFormBlankData(data.currentStepId));
			})
			.catch((error: unknown /* FIXME! */) => {
				setServerErrorMessage('Wizard failed');
				console.error('Error invoking next step of wizard:', error);
			});
	};

	useEffect(() => {
		void fetchStep({
			newsletterId: 'test',
			stepId: '',
		});
	}, []);

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

	const handleButtonClick = (id: string) => () => {
		void fetchStep({
			newsletterId: 'test',
			buttonId: id,
			stepId: serverData.currentStepId || '',
			formData: formData,
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
				<div>
					<p>FORM: {formSchema.description}</p>
					<SchemaForm
						schema={formSchema}
						data={formData}
						validationWarnings={{}}
						changeValue={changeFormData}
					/>
				</div>
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
