import { InlineError } from '@guardian/source-react-components';
import type { ZodIssue } from 'zod';

interface Props {
	issue: ZodIssue;
}

export const ZodIssueReport = ({ issue }: Props) => {
	const { path, message } = issue;
	const fieldKey = path.reduce<string>(
		(text, value) => (text ? `${text}.${value.toString()}` : value.toString()),
		'',
	);

	return (
		<InlineError>
			<b>{fieldKey}</b>
			<span> "{message}"</span>
		</InlineError>
	);
};
