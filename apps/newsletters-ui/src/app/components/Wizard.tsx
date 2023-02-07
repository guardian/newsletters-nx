import ReactMarkdown from 'react-markdown';

export interface WizardButtonProps {
	label: string;
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
				<button
					onClick={wizardButton.onClick}
					key={stepName + wizardButton.label}
				>
					{wizardButton.label}
				</button>
			))}
		</div>
	);
};
