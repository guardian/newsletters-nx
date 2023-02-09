import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { WIZARD_BUTTON_TYPES } from '@newsletters-nx/newsletters-data-client';
import { WizardButton } from './WizardButton';

/**
 * Interface for a button displayed in the wizard.
 */
export interface WizardButton {
	/** Unique identifier for the button. */
	id: string;
	/** Label displayed on the button. */
	label: string;
	/** Type of the button, mapped to a specific background and border color. */
	buttonType: keyof typeof WIZARD_BUTTON_TYPES;
}

/**
 * Interface for the response received from the server for a single step in the wizard.
 */
interface CurrentStepRouteResponse {
	/** Markdown content to display for the current step. */
	markdownToDisplay: string;
	/** Unique identifier for the current step. */
	currentStepId: string;
	/** Buttons to display for the current step. */
	buttons: Array<{
		/** Label displayed on the button. */
		label: string;
		/** Type of the button, mapped to a specific background and border color. */
		buttonType: keyof typeof WIZARD_BUTTON_TYPES;
		/** Unique identifier for the button. */
		id: string;
	}>;
}

/**
 * Interface for the props passed to the `Wizard` component.
 */
export interface WizardProps {
	/** Markdown content to display for the current step. */
	markdown: string;
	/** Unique identifier for the current step. */
	stepName: string;
	/** Buttons to display for the current step. */
	wizardButtons: WizardButton[];
}

/**
 * Component that displays a single step in a wizard, including markdown content and buttons.
 */
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
