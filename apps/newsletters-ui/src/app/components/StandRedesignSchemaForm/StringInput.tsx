import { TextArea } from '@guardian/stand/text-area';
import { TextInput } from '@guardian/stand/text-input';
import type { FormEventHandler } from 'react';
import type { FieldProps } from './util';
import { eventToString } from './util';

// TO DO - add allowTabAndCr prop, if we ever need
// to collect multiline/formatted text.

// Would involve extending the StringInputSettings type
// and the WizardStepLayout type so it can be configured
// from the layout and passed down from SchemaForm.

const tabAndCrPattern = /["\n"|"\t"]/g;

type Props = FieldProps & {
	value: string;
	inputHandler: { (value: string): void };
	inputType?: 'textInput' | 'textArea';
};

export const StandStringInput = (props: Props) => {
	const { inputType = 'textInput' } = props;

	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		const inputValue = eventToString(event);
		const processedValue = inputValue.replace(tabAndCrPattern, '');
		props.inputHandler(processedValue);
	};

	if (inputType === 'textInput') {
		return (
			<TextInput
				label={props.label}
				onInput={sendValue}
				value={props.value}
				isInvalid={!!props.error}
				error={props.error}
				isDisabled={props.readOnly}
				isRequired={!props.optional}
			/>
		);
	}

	return (
		<TextArea
			label={props.label}
			onInput={sendValue}
			value={props.value}
			isInvalid={!!props.error}
			error={props.error}
			isDisabled={props.readOnly}
			isRequired={!props.optional}
		/>
	);
};
