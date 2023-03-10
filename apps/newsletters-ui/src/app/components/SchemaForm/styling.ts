import { palette } from '@guardian/source-foundations';
import { css } from '@mui/material';

const { neutral } = palette;

export const defaultFieldStyle = css`
	margin-bottom: 0.75rem;
	max-width: 24rem;
	display: flex;
	justify-content: space-between;
`;

export const defaultFormStyle = css`
	padding: 0.5rem;
	margin-bottom: 1rem;
	max-width: 30rem;
	background-color: ${neutral[97]};

	legend {
		display: block;
		font-weight: bold;
		border-bottom: 1px solid ${neutral[20]};
		margin: 0.25rem 0 1rem;
	}
`;
