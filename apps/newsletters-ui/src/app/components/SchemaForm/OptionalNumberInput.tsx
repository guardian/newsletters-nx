import type { FormEventHandler, FunctionComponent } from 'react';
import { useRef } from 'react';
import { FieldWrapper } from './FieldWrapper';
import type { FieldProps } from './util';
import { eventToNumber } from './util';

export const OptionalNumberInput: FunctionComponent<
	FieldProps & {
		value: number | undefined;
		inputHandler: { (value: number | undefined): void };
		max?: number;
		min?: number;
		step?: number;
	}
> = (props) => {
	const numberFieldRef = useRef<HTMLInputElement>(null);

	const sendNumberValue: FormEventHandler<HTMLInputElement> = (event) => {
		props.inputHandler(eventToNumber(event));
	};

	const toggleUndefined: FormEventHandler<HTMLInputElement> = (event) => {
		const { checked } = event.target as HTMLInputElement;
		if (checked) {
			return props.inputHandler(undefined);
		}
		const numberInputValue = Number(numberFieldRef.current?.value);
		if (!isNaN(numberInputValue)) {
			return props.inputHandler(numberInputValue);
		}
		props.inputHandler(props.min ?? 0);
	};

	return (
		<FieldWrapper {...props}>
			<input
				type="number"
				disabled={typeof props.value === 'undefined'}
				value={props.value}
				max={props.max}
				min={props.min}
				step={props.step}
				onInput={sendNumberValue}
				ref={numberFieldRef}
			/>
			<span>
				<label>undef:</label>
				<input
					type="checkbox"
					checked={typeof props.value === 'undefined'}
					onChange={toggleUndefined}
				/>
			</span>
		</FieldWrapper>
	);
};
