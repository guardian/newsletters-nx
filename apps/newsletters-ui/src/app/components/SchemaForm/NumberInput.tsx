import { css, TextField } from '@mui/material';
import type { FormEventHandler, FunctionComponent } from 'react';
import type { FieldProps } from './FieldWrapper';
import { eventToNumber } from './util';


export const NumberInput: FunctionComponent<
	FieldProps & {
		value: number;
		inputHandler: { (value: number): void };
		max?: number; // NOT SUPPORTED
		min?: number; // NOT SUPPORTED
		step?: number; // NOT SUPPORTED
		type?: 'number' | 'range'; // WILL NEED A SEPARATE COMPONENT USING Slider COMPONENT
	}
> = (props) => {
	const { type = 'number' } = props;

	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		props.inputHandler(eventToNumber(event));
	};

	return (
		<div
			css={css`
				margin-bottom: 1rem;
				max-width: 24rem;
			`}
		>
			<TextField
				fullWidth
				variant="filled"
				label={props.label}
				type={type}
				value={props.value}
				onInput={sendValue}
				helperText={props.error}
				error={!!props.error}
				required={!props.optional}
				disabled={props.readOnly}
			/>
		</div>
	);
};
