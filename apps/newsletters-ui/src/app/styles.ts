import { css } from '@emotion/react';
import { space } from '@guardian/source/foundations';

export const tableStyle = css`
	border-collapse: collapse;
	th,
	td {
		border: 1px solid #dddddd;
		padding: ${space[2]}px;
		text-align: left;
	}
`;
