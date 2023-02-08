import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from './Button';
import type { BUTTON_TYPES } from './Button';

export interface WizardButtonProps {
	id: string;
	label: string;
	buttonType: keyof typeof BUTTON_TYPES;
}
interface CurrentStepRouteResponse {
	markdownToDisplay: string;
	currentStepId: string;
	buttons: Array<{
		label: string;
		buttonType: 'GREEN' | 'RED';
		id: string;
	}>;
}

export interface WizardProps {
	markdown: string;
	stepName: string;
	wizardButtons: WizardButtonProps[];
}

export const Wizard: React.FC<WizardProps> = ({
	markdown,
	stepName,
	wizardButtons,
}) => {
	const [response, setResponse] = useState<
		CurrentStepRouteResponse | undefined
	>({
		buttons: [{ label: 'hello', buttonType: 'GREEN', id: 'hello' }],
		currentStepId: 'hello',
		markdownToDisplay: 'hello',
	});

	// When the button is pressed fetch the next step of the wizard from /v1/currentStep
	// and update the state of the wizard with the new step
	const handleButtonClick = (id: string) => () => {
		setResponse(undefined);
		fetch(`/v1/currentStep`)
			.then((response) => response.json())
			.then((data: CurrentStepRouteResponse) => {
				setResponse(data as unknown as CurrentStepRouteResponse);
			})
			.catch((error) => {
				console.error('Error:', error);
			});
	};
	if (response === undefined) {
		return <p>'loading'</p>;
	}

	return (
		<div className="markdown-block">
			<ReactMarkdown>{response.markdownToDisplay}</ReactMarkdown>
			{response.buttons.map((button) => (
				<Button
					id="hello"
					label={button.label}
					buttonType={button.buttonType}
					onClick={handleButtonClick(button.id)}
					key={stepName + button.label}
				/>
			))}
		</div>
	);
};
