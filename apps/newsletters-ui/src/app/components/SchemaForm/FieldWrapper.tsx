import { css } from '@mui/material';
import type { ReactNode } from 'react';

export const defaultFieldStyle = css`
	margin-bottom: 0.75rem;
	max-width: 24rem;
	display: flex;
	justify-content: space-between;
`;

interface Props {
	children: ReactNode;
}

export const FieldWrapper = ({ children }: Props) => (
	<div css={defaultFieldStyle}>{children}</div>
);
