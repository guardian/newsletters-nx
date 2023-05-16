import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { appTheme } from '../../app-theme';

const Styles = styled.div`
	font-family: 'roboto';

	.left-aligned-step-button {
		b {
			text-decoration: underline;
		}

		& > .MuiStepLabel-horizontal {
			flex: 1;
			text-align: left;
			min-height: 4rem;
			transition: background-color 0.5s;
			&:hover {
				background-color: ${appTheme.palette.primary.light};
			}
		}
	}
`;

interface DefaultStylesProps {
	children: ReactNode;
}

export function DefaultStyles({ children }: DefaultStylesProps) {
	return <Styles>{children}</Styles>;
}
