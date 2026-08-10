import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import type { ZodError } from 'zod';

type ZodIssue = ZodError['issues'][number];

interface Props {
	issues: ZodIssue[];
}

const issueToMessage = (issue: ZodIssue): string => {
	if (issue.code === 'invalid_type' && issue.message === 'Required') {
		return `This is a required field (of type "${issue.expected}") but no value is set`;
	}

	return issue.message;
};

export const StandZodIssuesReport = ({ issues }: Props) => (
	<div
		css={css`
			margin: ${semanticSpacing.stackXs} 0 0;
			display: flex;
			flex-direction: column;
			gap: ${semanticSpacing.stackXs};
		`}
	>
		{issues.map((issue, index) => (
			<div key={index}>
				{issue.path.length > 0 && (
					<Typography element="div" variant="bodyBoldSm">
						{issue.path.join('.')}
					</Typography>
				)}
				<Typography
					element="div"
					variant="bodySm"
					cssOverrides={css`
						margin-left: ${semanticSpacing.stackMd};
					`}
				>
					{issueToMessage(issue)}
				</Typography>
			</div>
		))}
	</div>
);
