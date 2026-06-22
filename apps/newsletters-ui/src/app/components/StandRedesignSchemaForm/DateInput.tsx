import { css } from '@emotion/react'
import { DatePicker as StandDatePicker } from '@guardian/stand/DatePicker';
import type { DateValue } from '@internationalized/date';
import { CalendarDate } from '@internationalized/date';
import type { FunctionComponent } from 'react';
import { NotedLabel } from './NotedLabel';
import type { StandardFormProps } from './SchemaField';
import type { FieldProps } from './util';

// Converts the internal value from the DatePicker (DateValue) to a JS Date, which is what the form schema expects
// NB: DateValue is an instant without a time (and therefore without a timezone), but JS Date is a date with a time in the local timezone.
// This means that the resulting Date may be a different day depending on the user's timezone, but this corresponds to the old behaviour of the DateInput
const inputDateToDate = (inputDate: DateValue): Date => {
	return new Date(inputDate.year, inputDate.month - 1, inputDate.day);
};

// Converts a JS Date to a CalendarDate, which is what the StandDatePicker expects
const dateToCalendarDate = (date: Date): CalendarDate => {
	return new CalendarDate(
		date.getFullYear(),
		date.getMonth() + 1,
		date.getDate(),
	);
};

export const StandDateInput: FunctionComponent<
	FieldProps & StandardFormProps &{
		value: Date | undefined;
		inputHandler: { (value: Date): void };
		type?: HTMLInputElement['type'];
	}
> = (props) => {
	return (
		<StandDatePicker
			label={props.label}
			renderLabel={props.isNoted ? NotedLabel : undefined}
			value={props.value ? dateToCalendarDate(props.value) : undefined}
			isDisabled={props.readOnly}
			cssOverrides={css`
				max-width: 220px;
			`}
			description={props.description}
			onChange={(date) => {
				if (date) {
					props.inputHandler(inputDateToDate(date));
				}
			}}
			error={props.error}
			isInvalid={!!props.error}
		/>
	);
};
