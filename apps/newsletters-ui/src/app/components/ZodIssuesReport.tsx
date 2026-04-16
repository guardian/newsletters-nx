import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@mui/material';
import type { ZodError } from 'zod';

type ZodIssue = ZodError['issues'][number];

interface Props {
	issues: ZodIssue[];
	caption?: string;
}

const issueToMessage = (issue: ZodIssue): string => {
	const { code } = issue;
	switch (code) {
		case 'invalid_type': {
			const { expected, message } = issue;
			return message === 'Required'
				? `This is a required field (of type "${
						expected as string
				  }") but no value is set`
				: message;
		}

		case 'unrecognized_keys':
		case 'invalid_union':
		case 'too_small':
		case 'too_big':
		case 'not_multiple_of':
		case 'custom':
		default:
			return issue.message;
	}
};

export const ZodIssuesReport = ({ issues, caption }: Props) => {
	return (
		<TableContainer component={Paper}>
			<Table size="small">
				{caption && <caption style={{ captionSide: 'top' }}>{caption}</caption>}
				<TableBody>
					{issues.map((issue, index) => (
						<TableRow key={index}>
							<TableCell sx={{ fontWeight: 'bold' }}>
								{issue.path.join('/')}
							</TableCell>
							<TableCell>
								<span>{issueToMessage(issue)}</span>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};
