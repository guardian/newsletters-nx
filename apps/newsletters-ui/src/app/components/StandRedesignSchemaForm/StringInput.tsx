import { css } from '@emotion/react';
import { TextArea } from '@guardian/stand/TextArea';
import { TextInput } from '@guardian/stand/TextInput';
import type { FormEventHandler } from 'react';
import { NotedLabel } from './NotedLabel';
import type { StandardFormProps } from './SchemaField';
import type { FieldProps } from './util';
import { eventToString } from './util';

// TO DO - add allowTabAndCr prop, if we ever need
// to collect multiline/formatted text.

// Would involve extending the StringInputSettings type
// and the WizardStepLayout type so it can be configured
// from the layout and passed down from SchemaForm.

const tabAndCrPattern = /["\n"|"\t"]/g;

type Props = FieldProps &
	StandardFormProps & {
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
				cssOverrides={css`max-width: 450px`}
				description={props.description}
				onInput={sendValue}
				value={props.value}
				placeholder={props.placeholder}
				isInvalid={!!props.error}
				error={props.error}
				isDisabled={props.readOnly}
				isRequired={!props.optional}
				renderLabel={props.isNoted ? NotedLabel : undefined }
			/>
		);
	}

	return (
		<TextArea
			theme={{shared: {height: '88px'}}}
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
