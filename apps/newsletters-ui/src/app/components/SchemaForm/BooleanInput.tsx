import type { FormEventHandler, FunctionComponent } from 'react';
import type { FieldProps} from './FieldWrapper';
import { FieldWrapper } from './FieldWrapper';
import { eventToBoolean } from './util';


export const BooleanInput: FunctionComponent<
	FieldProps & {
		value: boolean;
		inputHandler: { (value: boolean): void };
	}
> = (props) => {
	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		props.inputHandler(eventToBoolean(event));
	};

	return (
		<FieldWrapper {...props}>
			<input type={'checkbox'} checked={props.value} onChange={sendValue} />
		</FieldWrapper>
	);
};
