import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { WIZARD_BUTTON_TYPES } from '@newsletters-nx/newsletters-data-client';
import { WizardButton } from './WizardButton';

export interface WizardButton {
	id: string;
	label: string;
	buttonType: keyof typeof WIZARD_BUTTON_TYPES;
}
interface CurrentStepRouteResponse {
	markdownToDisplay: string;
	currentStepId: string;
	buttons: Array<{
		label: string;
		buttonType: keyof typeof WIZARD_BUTTON_TYPES;
		id: string;
	}>;
}

export interface WizardProps {
	markdown: string;
	stepName: string;
	wizardButtons: WizardButton[];
}

export const Wizard: React.FC<WizardProps> = ({
	markdown,
	stepName,
	wizardButtons,
}) => {
	const firstPage: CurrentStepRouteResponse = {
		buttons: wizardButtons,
		currentStepId: stepName,
		markdownToDisplay: markdown,
	};
	const [response, setResponse] = useState<
		CurrentStepRouteResponse | undefined
	>(firstPage);

	// When the button is pressed fetch the next step of the wizard from /v1/currentStep
	// and update the state of the wizard with the new step
	const handleButtonClick = (id: string) => () => {
		setResponse(undefined);
		fetch(`/api/v1/currentStep`)
			.then((response) => response.json())
			.then((data: CurrentStepRouteResponse) => {
				setResponse(data as unknown as CurrentStepRouteResponse);
			})
			.catch((error: unknown /* FIXME! */) => {
				console.error('Error invoking next step of wizard:', error);
			});
	};
	if (response === undefined) {
		return <p>'loading'</p>;
	}

	return (
		<div className="markdown-block">
			<ReactMarkdown>{response.markdownToDisplay}</ReactMarkdown>
			{response.buttons.map((button) => (
				<WizardButton
					id={button.id}
					label={button.label}
					buttonType={button.buttonType}
					onClick={handleButtonClick(button.id)}
					key={stepName + button.label}
				/>
			))}
		</div>
	);
};
