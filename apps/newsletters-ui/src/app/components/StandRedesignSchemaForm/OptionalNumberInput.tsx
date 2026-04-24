import { Checkbox } from '@guardian/stand/checkbox';
import { TextInput } from '@guardian/stand/text-input';
import type { FormEventHandler, FunctionComponent } from 'react';
import { useState } from 'react';
import type { StandardFormProps } from './SchemaField';
import type { FieldProps } from './util';
import { eventToNumber } from './util';

export const StandOptionalNumberInput: FunctionComponent<
	FieldProps &
		StandardFormProps & {
			value: number | undefined;
			inputHandler: { (value: number | undefined): void };
			max?: number;
			min?: number;
		}
> = (props) => {
	const { value, label, description, min, max } = props;
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

	const toggleUndefined = (isSelected: boolean) => {
		if (isSelected) {
			return props.inputHandler(undefined);
		}

		props.inputHandler(storedNumber);
	};

	return (
		<>
			<TextInput
				label={label}
				description={description}
				type={'number'}
				value={props.value?.toString() ?? storedNumber.toString()}
				onInput={sendNumberValue}
				isInvalid={!!props.error}
				error={props.error}
				isRequired={!props.optional}
				isDisabled={typeof props.value === 'undefined' || props.readOnly}
			/>
			<Checkbox
				isSelected={typeof props.value === 'undefined'}
				onChange={toggleUndefined}
			>
				{label}
			</Checkbox>
		</>
	);
};
