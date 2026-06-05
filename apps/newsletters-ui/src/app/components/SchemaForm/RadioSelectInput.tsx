import type { SelectChangeEvent } from '@mui/material';
import {
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
} from '@mui/material';
import type { FunctionComponent } from 'react';
import { useId } from 'react';
import type { FieldProps } from './util';

const EMPTY_STRING = '';

export const RadioSelectInput: FunctionComponent<
	FieldProps & {
		value: string | undefined;
		optional?: boolean;
		inputHandler: { (value: string | undefined): void };
		options: string[];
	}
> = (props) => {
	const { value, optional, options, inputHandler, label = 'value' } = props;
	const labelId = useId();
	const handleChange = (event: SelectChangeEvent) => {
		if (event.target.value === EMPTY_STRING) {
			return inputHandler(undefined);
		}
		return inputHandler(event.target.value);
	};
	const valueAsString = value ?? EMPTY_STRING;

	return (
		<FormControl fullWidth>
			<FormLabel id={labelId}>
				{label}
			</FormLabel>
			<RadioGroup
				aria-labelledby={labelId}
				name={`radio-input-group-${label}`}
				value={valueAsString}
				onChange={handleChange}
			>
				{optional && (
					<FormControlLabel
						value={EMPTY_STRING}
						control={<Radio />}
						label={'[none]'}
					/>
				)}

				{options.map((option) => (
					<FormControlLabel
						key={option}
						value={option}
						control={<Radio />}
						label={option}
					/>
				))}
			</RadioGroup>
		</FormControl>
	);
};
