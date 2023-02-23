import { TextField } from '@mui/material';
import type { FormEventHandler, FunctionComponent } from 'react';
import { defaultFieldStyle } from './styling';
import type { FieldProps } from './util';
import { eventToNumber } from './util';

export const NumberInput: FunctionComponent<
	FieldProps & {
		value: number;
		inputHandler: { (value: number): void };
		max?: number;
		min?: number;
		step?: number; // NOT SUPPORTED
		type?: 'number' | 'range'; // WILL NEED A SEPARATE COMPONENT USING Slider COMPONENT
	}
> = (props) => {
	const { type = 'number', max, min } = props;

	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		const newValue = eventToNumber(event);
		if (typeof min === 'number' && newValue < min) {
			return;
		}
		if (typeof max === 'number' && newValue > max) {
			return;
		}
		props.inputHandler(eventToNumber(event));
	};

	return (
		<div css={defaultFieldStyle}>
			<TextField
				fullWidth
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
