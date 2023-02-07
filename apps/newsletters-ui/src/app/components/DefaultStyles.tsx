import styled from '@emotion/styled';
import type { ReactNode } from 'react';

const Styles = styled.div`
	font-family: 'roboto';
`;

interface DefaultStylesProps {
	children: ReactNode;
}

export function DefaultStyles({ children }: DefaultStylesProps) {
	return <Styles>{children}</Styles>;
}
