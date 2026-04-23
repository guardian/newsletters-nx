import { TextInput } from '@guardian/stand/text-input';
import type { FormEventHandler, FunctionComponent } from 'react';
import type { StandardFormProps } from './SchemaField';
import type { FieldProps } from './util';
import { eventToNumber } from './util';

export const StandNumberInput: FunctionComponent<
	FieldProps &
		StandardFormProps & {
			value: number;
			inputHandler: { (value: number): void };
			max?: number;
			min?: number;
		}
> = (props) => {
	const { max, min } = props;

	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		const newValue = eventToNumber(event);
		if (typeof min === 'number' && newValue < min) {
			return;
		}
		if (typeof max === 'number' && newValue > max) {
			return;
		}
		props.inputHandler(eventToNumber(event));
	};

	return (
		<TextInput
			label={props.label}
			description={props.description}
			type="number"
			value={props.value.toString()}
			onInput={sendValue}
			isInvalid={!!props.error}
			error={props.error}
			isRequired={!props.optional}
			isDisabled={props.readOnly}
		/>
	);
};
