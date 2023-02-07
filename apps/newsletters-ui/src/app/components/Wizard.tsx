import ReactMarkdown from 'react-markdown';
import { Button } from './Button';
import type { ButtonType } from './Button';

export interface WizardButtonProps {
	label: string;
	buttonType: ButtonType;
	onClick: () => void;
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
	return (
		<div className="markdown-block">
			<ReactMarkdown>{markdown}</ReactMarkdown>
			{wizardButtons.map((wizardButton) => (
				<Button
					label={wizardButton.label}
					buttonType={wizardButton.buttonType}
					onClick={wizardButton.onClick}
					key={stepName + wizardButton.label}
				/>
			))}
		</div>
	);
};
