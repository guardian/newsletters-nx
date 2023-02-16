import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { CurrentStepRouteResponse } from '@newsletters-nx/state-machine';
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

	const fetchStep = (body: Record<string, string>) => {
		return fetch(`/api/v1/currentstep`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
			.then((response) => response.json())
			.then((data: CurrentStepRouteResponse) => {
				setWizardStep(data as unknown as CurrentStepRouteResponse);
			})
			.catch((error: unknown /* FIXME! */) => {
				console.error('Error invoking next step of wizard:', error);
			});
	};
	useEffect(() => {
		void fetchStep({
			newsletterId: 'test',
		});
	}, []);

	const handleButtonClick = (id: string) => () => {
		void fetchStep({
			newsletterId: 'test',
			buttonId: id,
		});
	};

	if (wizardStep === undefined) {
		return <p>'loading'</p>;
	}
	return (
		<div className="markdown-block">
			<ReactMarkdown>{wizardStep.markdownToDisplay ?? ''}</ReactMarkdown>
			{Object.entries(wizardStep.buttons ?? {}).map(([key, button]) => (
				<WizardButton
					id={button.id}
					label={button.label}
					buttonType={button.buttonType}
					onClick={handleButtonClick(button.id)}
					key={key + button.label}
				/>
			))}
		</div>
	);
};
