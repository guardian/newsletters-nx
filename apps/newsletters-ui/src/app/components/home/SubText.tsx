import type { SerializedStyles } from '@emotion/react';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { subTextStyle } from './home.styles';

/** Weak-coloured small text for the secondary lines in a newsletter row. */
export const SubText = ({
	children,
	cssOverrides,
}: {
	children: ReactNode;
	cssOverrides?: SerializedStyles;
}) => (
	<Typography
		element="span"
		variant="bodySm"
		cssOverrides={cssOverrides ? [subTextStyle, cssOverrides] : subTextStyle}
	>
		{children}
	</Typography>
);
