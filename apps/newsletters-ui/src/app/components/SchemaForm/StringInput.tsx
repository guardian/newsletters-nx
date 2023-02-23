import type { FormEventHandler, FunctionComponent } from 'react';
import type { FieldProps } from './FieldWrapper';
import { FieldWrapper } from './FieldWrapper';
import { eventToString } from './util';

export const StringInput: FunctionComponent<
	FieldProps & {
		value: string;
		inputHandler: { (value: string): void };
		type?: HTMLInputElement['type'];
	}
> = (props) => {
	const { type = 'text' } = props;

	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		props.inputHandler(eventToString(event));
	};

	return (
		<FieldWrapper {...props}>
			<input type={type} value={props.value} onInput={sendValue} />
		</FieldWrapper>
	);
};
