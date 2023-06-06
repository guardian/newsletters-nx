import {
	Checkbox,
	FormControlLabel,
	FormGroup,
	TextField,
} from '@mui/material';
import type { FormEventHandler, FunctionComponent } from 'react';
import { useState } from 'react';
import { FieldWrapper } from './FieldWrapper';
import type { FieldProps } from './util';
import { eventToNumber } from './util';

/**
 * Note - Material UI TextFields do not support the 'step' attribute.
 * The prop will have no effect, but is retained so this implementation
 * wors with the SchemaFieldProps interface.
 */
export const OptionalNumberInput: FunctionComponent<
	FieldProps & {
		value: number | undefined;
		inputHandler: { (value: number | undefined): void };
		max?: number;
		min?: number;
		/**Material UI TextFields do not support the 'step' attribute */
		step?: number;
	}
> = (props) => {
	const { value, label, min, max } = props;
	const [storedNumber, setStoredNumber] = useState(value ?? 0);

	const sendNumberValue: FormEventHandler<HTMLInputElement> = (event) => {
		const newValue = eventToNumber(event);
		if (typeof min === 'number' && newValue < min) {
			return;
		}
		if (typeof max === 'number' && newValue > max) {
			return;
		}
		setStoredNumber(newValue);
		props.inputHandler(eventToNumber(event));
	};

	const toggleUndefined: FormEventHandler<HTMLInputElement> = (event) => {
		const { checked } = event.target as HTMLInputElement;
		if (checked) {
			return props.inputHandler(undefined);
		}

		props.inputHandler(storedNumber);
	};

	return (
		<FieldWrapper>
			<TextField
				label={label}
				type={'number'}
				value={props.value ?? storedNumber}
				onInput={sendNumberValue}
				helperText={props.error}
				error={!!props.error}
				required={!props.optional}
				disabled={typeof props.value === 'undefined' || props.readOnly}
			/>
			<FormGroup>
				<FormControlLabel
					control={
						<Checkbox
							checked={typeof props.value === 'undefined'}
							onChange={toggleUndefined}
						/>
					}
					label={`${label ?? ''} undefined`}
				/>
			</FormGroup>
		</FieldWrapper>
	);
};
