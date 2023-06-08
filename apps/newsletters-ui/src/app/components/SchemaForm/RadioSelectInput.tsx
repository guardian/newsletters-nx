import type { SelectChangeEvent } from '@mui/material';
import {
	FormControl,
	FormControlLabel,
	FormLabel,
	Radio,
	RadioGroup,
} from '@mui/material';
import type { FunctionComponent } from 'react';
import { defaultFieldStyle } from './styling';
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
				<FormLabel id={`radio-input-label-${label}-${options.toString()}`}>
					{label}
				</FormLabel>
				<RadioGroup
					aria-labelledby={`radio-input-label-${label}-${options.toString()}`}
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
		</div>
	);
};
