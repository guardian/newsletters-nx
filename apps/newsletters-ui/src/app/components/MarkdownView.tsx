import ReactMarkdown from 'react-markdown';

interface MarkdownViewProps {
	markdown: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ markdown }) => {
	return (
		<div className="markdown-block">
			<ReactMarkdown>{markdown}</ReactMarkdown>
		</div>
	);
};
