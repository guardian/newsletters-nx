import { TextField } from '@mui/material';
import type { FormEventHandler, FunctionComponent } from 'react';
import { defaultFieldStyle } from './styling';
import type { FieldProps } from './util';
import { eventToString } from './util';

const formatDate = (date: Date) => {
	const month = date.getUTCMonth() + 1;
	const paddedMonth = month < 10 ? `0${month.toString()}` : month.toString();
	const dayOfMonth = date.getUTCDate();
	const paddedDayOfMonth =
		dayOfMonth < 10 ? `0${dayOfMonth.toString()}` : dayOfMonth.toString();

	return `${date.getUTCFullYear()}-${paddedMonth}-${paddedDayOfMonth}`;
};

export const DateInput: FunctionComponent<
	FieldProps & {
		value: Date | undefined;
		inputHandler: { (value: Date): void };
		type?: HTMLInputElement['type'];
	}
> = (props) => {
	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		const stringValue = eventToString(event);
		const dateValue = new Date(stringValue);
		props.inputHandler(dateValue);
	};

	const formattedDate = props.value ? formatDate(props.value) : '';

	return (
		<div css={defaultFieldStyle}>
			<TextField
				fullWidth
				label={props.label}
				type={'date'}
				value={formattedDate}
				onInput={sendValue}
				helperText={props.error}
				error={!!props.error}
				required={!props.optional}
				disabled={props.readOnly}
			/>
		</div>
	);
};
