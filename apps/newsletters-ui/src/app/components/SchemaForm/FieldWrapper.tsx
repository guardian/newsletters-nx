import { css } from '@emotion/react';
import {
	error,
	neutral,
	space,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import type { FunctionComponent, ReactNode } from 'react';

const fieldStyle = (readOnly?: boolean) => css`
	padding-bottom: ${space[1]}px;
	${readOnly && `background-color: ${neutral[93]};`}

	label {
		${textSansObjectStyles.xsmall({ fontWeight: 'bold' })}
	}

	input {
		padding: 0 ${space[2]}px;
		${textSansObjectStyles.small({ fontWeight: 'regular' })}
	}

	> span {
		${textSansObjectStyles.xxsmall()}
	}
`;

const errorStyle = css`
	color: ${error[400]};
`;

export type FieldProps = {
	label?: string;
	error?: string;
	optional?: boolean;
	readOnly?: boolean;
};
export const FieldWrapper: FunctionComponent<
	FieldProps & { children?: ReactNode }
> = ({ children, label, error, optional, readOnly }) => {
	return (
		<div css={fieldStyle(readOnly)}>
			{label && <label>{label}</label>}
			{optional && <span>(optional)</span>}
			{children}
			{readOnly && <span>(read only)</span>}
			{error && <strong css={errorStyle}>! {error}</strong>}
		</div>
	);
};

