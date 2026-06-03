import { baseSpacing } from '@guardian/stand';
import { Radio, RadioGroup } from '@guardian/stand/RadioGroup';
import { TextInput } from '@guardian/stand/TextInput';
import type { TextInputProps } from '@guardian/stand/TextInput';
import { useEffect, useState } from 'react';
import type { FormEventHandler } from 'react';
import type { FunctionComponent } from 'react';
import { NotedLabel } from './NotedLabel';
import type { StandardFormProps } from './SchemaField';
import type { FieldProps } from './util';
import { eventToString } from './util';

const EMPTY_STRING = '';
const OTHER_OPTION_VALUE = '__other_option__';

export const StandRadioSelectInput: FunctionComponent<
	FieldProps &
		StandardFormProps & {
			value: string | undefined;
			options: string[];
			otherInputLabel?: string;
			otherInputProps?: Omit<
				TextInputProps,
				'value' | 'onInput' | 'isInvalid' | 'error' | 'isDisabled' | 'label'
			>;
		}
> = (props) => {
	const {
		value,
		options,
		otherInputLabel,
		optional,
		inputHandler,
		label = 'value',
		description,
	} = props;

	const hasCustomValue =
		typeof value === 'string' &&
		value !== EMPTY_STRING &&
		!options.includes(value);
	const [isOtherSelected, setIsOtherSelected] = useState(false);

	useEffect(() => {
		if (hasCustomValue) {
			setIsOtherSelected(true);
		}
	}, [hasCustomValue]);

	const showCustomInput =
		otherInputLabel && (hasCustomValue || isOtherSelected);
	const radioGroupValue =
		otherInputLabel && (hasCustomValue || isOtherSelected)
			? OTHER_OPTION_VALUE
			: value;

	const handleRadioChange = (newValue: string) => {
		if (newValue === OTHER_OPTION_VALUE) {
			setIsOtherSelected(true);
			inputHandler(EMPTY_STRING);
			return;
		}
		setIsOtherSelected(false);
		inputHandler(newValue);
	};

	const handleCustomInput: FormEventHandler<HTMLInputElement> = (event) => {
		inputHandler(eventToString(event));
	};

	return (
		<div>
			<RadioGroup
				label={label}
				onChange={handleRadioChange}
				value={radioGroupValue}
				description={description ?? ''}
				renderLabel={props.isNoted ? NotedLabel : undefined }
			>
				{/* Haven't seen this used but have preserved this way of doing it */}
				{optional && <Radio value={EMPTY_STRING}>[none]</Radio>}
				{options.map((option) => (
					<Radio key={option} value={option}>
						{option}
					</Radio>
				))}
				{otherInputLabel && (
					<Radio key={OTHER_OPTION_VALUE} value={OTHER_OPTION_VALUE}>
						{otherInputLabel}
					</Radio>
				)}
			</RadioGroup>
			{showCustomInput && (
				<TextInput
					aria-label={`${otherInputLabel}`}
					onInput={handleCustomInput}
					value={typeof value === 'string' ? value : EMPTY_STRING}
					isInvalid={!!props.error}
					error={props.error}
					isDisabled={props.readOnly}
					{...props.otherInputProps}
					theme={{
						...props.otherInputProps?.theme,
						shared: {
							...props.otherInputProps?.theme?.shared,
							// the designs call for 12px (0.75rem) between the radio group and the custom input
							// by default the TextInput has 8px (0.5rem) margin-top and  the radio group has 8px (0.5rem) margin-bottom,
							// so we replace the TextInput margin-top with 4px (0.25rem) to achieve the desired spacing
							marginTop: baseSpacing['4Rem'],
						},
					}}
				/>
			)}
		</div>
	);
};
