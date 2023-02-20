import { useEffect, useState } from 'react';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
} from '@newsletters-nx/state-machine';
import { MarkdownView } from './MarkdownView';
import { WizardButton } from './WizardButton';

/**
 * Interface for the props passed to the `Wizard` component.
 */
export interface WizardProps {
	newsletterId?: string;
}

/**
 * Component that displays a single step in a wizard, including markdown content and buttons.
 */
export const Wizard: React.FC<WizardProps> = () => {
	const [wizardStep, setWizardStep] = useState<
		CurrentStepRouteResponse | undefined
	>(undefined);
	const [errorMesssage, setErrorMessage] = useState<string | undefined>();

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
				if (data.errorMessage) {
					console.warn(data.errorMessage)
					setErrorMessage(data.errorMessage)
					return
				}

				setWizardStep(data as unknown as CurrentStepRouteResponse);
			})
			.catch((error: unknown /* FIXME! */) => {
				setErrorMessage('Wizard failed')
				console.error('Error invoking next step of wizard:', error);
			});
	};

	useEffect(() => {
		void fetchStep({
			newsletterId: 'test',
			stepId: '',
		});
	}, []);

	if (wizardStep === undefined) {
		return <p>'loading'</p>;
	}

	if (errorMesssage) {
		return (
			<p>
				<b>ERROR:</b>
				<span>{errorMesssage}</span>
			</p>
		);
	}

	const handleButtonClick = (id: string) => () => {
		void fetchStep({
			newsletterId: 'test',
			buttonId: id,
			stepId: wizardStep.currentStepId || '',
		});
	};

	return (
		<>
			<MarkdownView markdown={wizardStep.markdownToDisplay ?? ''} />
			{Object.entries(wizardStep.buttons ?? {}).map(([key, button]) => (
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
