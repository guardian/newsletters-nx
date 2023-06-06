import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
	children: ReactNode;
}

export const defaultBoxProps: BoxProps = {
	display: 'flex',
	justifyContent: 'space-between',
	marginBottom: 3,
	maxWidth: 400,
};

export const FieldWrapper = ({ children }: Props) => (
	<Box {...defaultBoxProps}>{children}</Box>
);
