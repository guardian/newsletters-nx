import type { SelectChangeEvent } from '@mui/material';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import type { FunctionComponent } from 'react';
import { defaultFieldStyle } from './styling';
import type { FieldProps } from './util';

const undefToken = '_____';

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
		if (event.target.value === undefToken) {
			return inputHandler(undefined);
		}
		return inputHandler(event.target.value);
	};
	const valueWithUndefinedToken = value ?? undefToken;

	return (
		<div css={defaultFieldStyle}>
			<FormControl fullWidth>
				<InputLabel id="demo-simple-select-label">{label}</InputLabel>
				<Select
					value={valueWithUndefinedToken}
					label={label}
					onChange={handleChange}
				>
					{optional && <MenuItem value={undefToken}>Select value</MenuItem>}
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
