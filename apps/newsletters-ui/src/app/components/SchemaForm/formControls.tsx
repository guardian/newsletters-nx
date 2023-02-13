import { css } from '@emotion/react';
import {
	error,
	neutral,
	space,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import { useRef } from 'react';
import type { FormEventHandler, FunctionComponent, ReactNode } from 'react';
import { eventToBoolean, eventToNumber } from './util';

const fieldStyle = (readOnly?: boolean) => css`
	padding-bottom: ${space[1]}px;
	${readOnly && `background-color: ${neutral[93]};`}

	label {
		${textSansObjectStyles.xsmall({ fontWeight: 'bold' })}
	}

	input {
		padding: 0 ${space[2]}px;
		${textSansObjectStyles.small({ fontWeight: 'regular' })}
	}

	> span {
		${textSansObjectStyles.xxsmall()}
	}
`;

const errorStyle = css`
	color: ${error[400]};
`;

export type FieldProps = {
	label?: string;
	error?: string;
	optional?: boolean;
	readOnly?: boolean;
};
export const FieldWrapper: FunctionComponent<
	FieldProps & { children?: ReactNode }
> = ({ children, label, error, optional, readOnly }) => {
	return (
		<div css={fieldStyle(readOnly)}>
			{label && <label>{label}</label>}
			{optional && <span>(optional)</span>}
			{children}
			{readOnly && <span>(read only)</span>}
			{error && <strong css={errorStyle}>! {error}</strong>}
		</div>
	);
};

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

export const SelectInput: FunctionComponent<
	FieldProps & {
		value: string | undefined;
		optional?: boolean;
		inputHandler: { (value: string | undefined): void };
		options: string[];
	}
> = (props) => {
	const { value, optional, options, inputHandler, label = 'value' } = props;

	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		return inputHandler(event.target.value || undefined);
	};

	return (
		<FieldWrapper {...props}>
			<select onChange={handleChange} value={value}>
				{optional && (
					// picking the default option should result in the field being set to undefined
					// but if the option value is undefined, the target.value the change event will
					// use the text content of the option as a fall back.
					<option value={''}>{`select ${label}`}</option>
				)}
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</FieldWrapper>
	);
};

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
