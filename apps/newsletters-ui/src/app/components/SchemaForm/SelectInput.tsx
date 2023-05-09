import type { SelectChangeEvent } from '@mui/material';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { FunctionComponent } from 'react';
import { defaultFieldStyle } from './styling';
import type { FieldProps } from './util';

const EMPTY_STRING = '';

export const SelectInput: FunctionComponent<
	FieldProps & {
		value: string | undefined;
		optional?: boolean;
		inputHandler: { (value: string | undefined): void };
		options: string[];
	}
> = (props) => {
	const { value, optional, options, inputHandler, label = 'value' } = props;
	const handleChange = (event: SelectChangeEvent<string>) => {
		if (event.target.value === EMPTY_STRING) {
			return inputHandler(undefined);
		}
		return inputHandler(event.target.value);
	};
	const valueAsString = value ?? EMPTY_STRING;

	return (
		<div css={defaultFieldStyle}>
			<FormControl fullWidth>
				<InputLabel id={`select-input-label-${label}-${options.toString()}`}>
					{label}
				</InputLabel>
				<Select value={valueAsString} label={label} onChange={handleChange}>
					{optional && <MenuItem value={EMPTY_STRING}>[none]</MenuItem>}
					{options.map((option) => (
						<MenuItem key={option} value={option}>
							{option}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};
