import ReactMarkdown from 'react-markdown';

export interface WizardButtonProps {
	label: string;
	onClick: () => void;
}

export interface WizardProps {
	markdown: string;
	wizardButtons: WizardButtonProps[];
}

export const Wizard: React.FC<WizardProps> = ({ markdown, wizardButtons }) => {
	return (
		<div className="markdown-block">
			<ReactMarkdown>{markdown}</ReactMarkdown>
			{wizardButtons.map((wizardButton, index) => (
				<button onClick={wizardButton.onClick} key={index}>{wizardButton.label}</button>
			))}
		</div>
	);
};
