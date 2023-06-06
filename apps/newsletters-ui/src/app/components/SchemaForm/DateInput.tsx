import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { locale } from 'dayjs';
import type { FunctionComponent } from 'react';
import { defaultFieldStyle } from './styling';
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
		<div css={defaultFieldStyle}>
			<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
				<DatePicker
					label={props.label}
					value={value}
					disabled={props.readOnly}
					onChange={(date, error) => {
						if (date) {
							props.inputHandler(date.toDate());
						}
					}}
					readOnly={props.readOnly}
				/>
			</LocalizationProvider>
		</div>
	);
};
