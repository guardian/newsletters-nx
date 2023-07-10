import { TextField } from '@mui/material';
import type { FormEventHandler, FunctionComponent } from 'react';
import type { FieldProps } from './util';
import { eventToString } from './util';

export const StringInput: FunctionComponent<
	FieldProps & {
		value: string;
		inputHandler: { (value: string): void };
		type?: HTMLInputElement['type'];
	}
> = (props) => {
	const { type = 'text' } = props;

	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		props.inputHandler(eventToString(event));
	};

	return (
		<TextField
			multiline={type === 'textArea'}
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
	);
};
