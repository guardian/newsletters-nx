import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
} from '@mui/material';
import type { ZodIssue } from 'zod';

interface Props {
	issues: ZodIssue[];
	caption?: string;
}

const issueToMessage = (issue: ZodIssue): string => {
	const { code } = issue;
	switch (code) {
		case 'invalid_date':
			return 'This field needs to contain a valid date.';
		case 'invalid_type': {
			const { expected, message } = issue;
			return message === 'Required'
				? `This is a required field (of type "${
						expected as string
				  }") but no value is set`
				: message;
		}

		case 'invalid_literal':
		case 'unrecognized_keys':
		case 'invalid_union':
		case 'invalid_union_discriminator':
		case 'invalid_enum_value':
		case 'invalid_arguments':
		case 'invalid_return_type':
		case 'invalid_string':
		case 'too_small':
		case 'too_big':
		case 'invalid_intersection_types':
		case 'not_multiple_of':
		case 'not_finite':
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
