import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { locale } from 'dayjs';
import type { FunctionComponent } from 'react';
import type { FieldProps } from './util';
import 'dayjs/locale/en-gb';

export const DateInput: FunctionComponent<
	FieldProps & {
		value: Date | undefined;
		inputHandler: { (value: Date): void };
		type?: HTMLInputElement['type'];
	}
> = (props) => {
	const value =
		props.value instanceof Date ? dayjs(props.value.toDateString()) : null;
	void locale('en-gb');
	return (
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
			<DatePicker
				label={props.label}
				value={value}
				disabled={props.readOnly}
				onChange={(date) => {
					if (date && date.toString() !== 'Invalid Date') {
						props.inputHandler(new Date(date.format('YYYY-MM-DD')));
					}
				}}
				readOnly={props.readOnly}
			/>
		</LocalizationProvider>
	);
};
