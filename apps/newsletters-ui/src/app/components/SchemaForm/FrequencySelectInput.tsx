import type { SelectChangeEvent } from '@mui/material';
import {
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from '@mui/material';
import type { FormEventHandler, FunctionComponent } from 'react';
import { useEffect, useState } from 'react';
import type { FieldProps } from './util';

const FREQUENCY_OPTIONS = [
	'Daily',
	'Weekdays',
	'Twice weekly',
	'Weekly',
	'Fortnightly',
	'Monthly',
] as const;

const CUSTOM_KEY = 'custom';

const frequencyOptionSet = new Set<string>(FREQUENCY_OPTIONS);

const isExistingCustomValue = (value: string | undefined): value is string =>
	value !== undefined && value !== '' && !frequencyOptionSet.has(value);

export const FrequencySelectInput: FunctionComponent<
	FieldProps & {
		value?: string;
		inputHandler: (value?: string) => void;
	}
> = ({
	value,
	optional,
	inputHandler,
	label = 'Frequency',
	readOnly,
	error,
}) => {
	const [isInCustomMode, setIsInCustomMode] = useState<boolean>(() =>
		isExistingCustomValue(value),
	);
	const [localCustomValue, setLocalCustomValue] = useState<string>(() =>
		isExistingCustomValue(value) ? value : '',
	);

	useEffect(() => {
		if (value === undefined || frequencyOptionSet.has(value)) {
			setIsInCustomMode(false);
			setLocalCustomValue('');
		}
	}, [value]);

	const selectValue = isInCustomMode ? CUSTOM_KEY : (value ?? '');

	const handleSelectChange = (event: SelectChangeEvent) => {
		const selected = event.target.value;
		if (selected === CUSTOM_KEY) {
			setIsInCustomMode(true);
			setLocalCustomValue('');
			inputHandler('');
		} else if (selected === '') {
			setIsInCustomMode(false);
			setLocalCustomValue('');
			inputHandler(undefined);
		} else {
			setIsInCustomMode(false);
			setLocalCustomValue('');
			inputHandler(selected);
		}
	};

	const handleTextInput: FormEventHandler<HTMLInputElement> = (event) => {
		const text = (event.target as HTMLInputElement).value;
		setLocalCustomValue(text);
		inputHandler(text);
	};

	return (
		<FormControl fullWidth error={!isInCustomMode && !!error}>
			<InputLabel shrink id={`select-input-label-${label}`}>
				{label}
			</InputLabel>
			<Select
				labelId={`select-input-label-${label}`}
				value={selectValue}
				label={label}
				onChange={handleSelectChange}
				disabled={readOnly}
				displayEmpty
			>
				<MenuItem value={''} disabled>
					<em>Please select a frequency</em>
				</MenuItem>
				{optional && <MenuItem value={''}>[none]</MenuItem>}
				{FREQUENCY_OPTIONS.map((option) => (
					<MenuItem key={option} value={option}>
						{option}
					</MenuItem>
				))}
				<MenuItem value={CUSTOM_KEY}>Custom</MenuItem>
			</Select>
			{!isInCustomMode && error && <FormHelperText>{error}</FormHelperText>}
			{isInCustomMode && (
				<TextField
					fullWidth
					label="Custom frequency"
					value={localCustomValue}
					onInput={handleTextInput}
					error={!!error}
					helperText={error}
					disabled={readOnly}
					sx={{ marginTop: 1 }}
				/>
			)}
		</FormControl>
	);
};
