import type { FormEventHandler, FunctionComponent } from 'react';
import type { FieldProps } from './FieldWrapper';
import { FieldWrapper } from './FieldWrapper';
import { eventToNumber } from './util';

export const NumberInput: FunctionComponent<
	FieldProps & {
		value: number;
		inputHandler: { (value: number): void };
		max?: number;
		min?: number;
		step?: number;
		type?: 'number' | 'range';
	}
> = (props) => {
	const { type = 'number' } = props;

	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		props.inputHandler(eventToNumber(event));
	};

	return (
		<FieldWrapper {...props}>
			<input
				type={type}
				value={props.value}
				max={props.max}
				min={props.min}
				step={props.step}
				onInput={sendValue}
			/>
		</FieldWrapper>
	);
};
