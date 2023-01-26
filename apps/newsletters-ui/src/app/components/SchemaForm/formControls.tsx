/* eslint-disable @typescript-eslint/prefer-nullish-coalescing -- because*/
/* eslint-disable @typescript-eslint/prefer-optional-chain -- because*/
import { useEffect, useRef, useState } from 'react';
import type { FormEventHandler, FunctionComponent, MouseEventHandler , ReactNode} from 'react';
import { eventToBoolean, eventToNumber, eventToString } from './util';

type FieldProps = {
	block?: boolean;
	className?: string;
	label?: string;
};
const FieldWrapper: FunctionComponent<
	FieldProps & { children?: ReactNode }
> = ({ children, block, className, label }) => {
	return block ? (
		<div className={className}>
			{label && <label>{label}</label>}
			{children}
		</div>
	) : (
		<>
			{label && <label>{label}</label>}
			{children}
		</>
	);
};

export const ParallaxInput: FunctionComponent<
	FieldProps & {
		value: number;
		inputHandler: { (value: number): void };
	}
> = (props) => {
	const { label = 'parallax' } = props;

	return <NumberInput {...props} label={label} max={2} min={0} step={0.05} />;
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
	const width = type === 'range' ? '5rem' : '3rem';

	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		props.inputHandler(eventToNumber(event));
	};

	return (
		<FieldWrapper {...props}>
			<input
				type={type}
				style={{ width }}
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
				style={{ width: '3rem' }}
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

export const TextInput: FunctionComponent<{
	label: string;
	value: string;
	type?: string;
	onInput: FormEventHandler<HTMLInputElement>;
}> = (props) => {
	const { label, type = 'text' } = props;
	return (
		<>
			<label>{label}</label>
			<input {...props} type={type} />
		</>
	);
};

export const StringInput: FunctionComponent<
	FieldProps & {
		value: string;
		type?: string;
		inputHandler: { (value: string): void };
		suggestions?: string[];
	}
> = (props) => {
	const { type = 'text', value, inputHandler, suggestions } = props;

	const datalistId = suggestions ? suggestions.join() : undefined;

	if (type === 'textArea') {
		return (
			<FieldWrapper {...props}>
				<textarea
					onInput={(event): void => {
						inputHandler(eventToString(event));
					}}
				>
					{value}
				</textarea>
			</FieldWrapper>
		);
	}

	return (
		<FieldWrapper {...props}>
			<input
				value={value}
				type={type}
				list={datalistId}
				onInput={(event): void => {
					inputHandler(eventToString(event));
				}}
			/>

			{suggestions && (
				<datalist id={datalistId}>
					{suggestions.map((suggestion, index) => (
						<option value={suggestion} key={index} />
					))}
				</datalist>
			)}
		</FieldWrapper>
	);
};

export const OptionalStringInput: FunctionComponent<
	FieldProps & {
		value: string | undefined;
		type?: string;
		inputHandler: { (value: string | undefined): void };
	}
> = (props) => {
	const { type = 'text', value, inputHandler } = props;
	const textFieldRef = useRef<HTMLInputElement>(null);

	const sendStringValue: FormEventHandler<HTMLInputElement> = (event) => {
		inputHandler(eventToString(event));
	};

	const toggleUndefined: FormEventHandler<HTMLInputElement> = (event) => {
		const { checked } = event.target as HTMLInputElement;
		if (checked) {
			return inputHandler(undefined);
		}
		const textInputValue = textFieldRef.current?.value;
		props.inputHandler(textInputValue || '');
	};

	return (
		<FieldWrapper {...props}>
			<input
				type={type}
				disabled={typeof value === 'undefined'}
				value={value}
				onInput={sendStringValue}
				ref={textFieldRef}
			/>
			<span>
				<label>undef:</label>
				<input
					type="checkbox"
					checked={typeof value === 'undefined'}
					onChange={toggleUndefined}
				/>
			</span>
		</FieldWrapper>
	);
};

export const CheckBoxInput: FunctionComponent<
	FieldProps & {
		value?: boolean;
		inputHandler: { (value: boolean): void };
	}
> = (props) => {
	const sendValue: FormEventHandler<HTMLInputElement> = (event) => {
		props.inputHandler(eventToBoolean(event));
	};
	return (
		<FieldWrapper {...props}>
			<input type="checkbox" checked={props.value} onChange={sendValue} />
		</FieldWrapper>
	);
};

export const TriStateInput: FunctionComponent<
	FieldProps & {
		name?: string;
		value: boolean | undefined;
		inputHandler: { (value: boolean | undefined): void };
	}
> = (props) => {
	return (
		<FieldWrapper {...props}>
			<div>
				<label>undefined</label>
				<input
					type="radio"
					name={props.name ?? props.label}
					checked={props.value === undefined}
					onInput={(): void => props.inputHandler(undefined)}
				/>
				|<label>true</label>
				<input
					type="radio"
					name={props.name ?? props.label}
					checked={props.value === true}
					onInput={(): void => props.inputHandler(true)}
				/>
				|<label>false</label>
				<input
					type="radio"
					name={props.name ?? props.label}
					checked={props.value === false}
					onInput={(): void => props.inputHandler(false)}
				/>
			</div>
		</FieldWrapper>
	);
};

export const DeleteButton: FunctionComponent<{
	label: string;
	onClick: MouseEventHandler;
	noConfirmation?: boolean;
	confirmationText?: string;
	className?: string;
}> = (props) => {
	const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

	const handleFirstButton = props.noConfirmation
		? props.onClick
		: (): void => {
				setShowConfirmation(true);
		  };

	if (!showConfirmation) {
		return (
			<div>
				<button className={props.className} onClick={handleFirstButton}>
					{props.label}
				</button>
			</div>
		);
	}

	const warningText =
		props.confirmationText ?? `Are you sure you want to ${props.label}?`;
	return (
		<div>
			<p>
				<Warning>{warningText}</Warning>
			</p>
			<button
				onClick={(): void => {
					setShowConfirmation(false);
				}}
			>
				cancel
			</button>
			<button
				className={props.className}
				onClick={(event): void => {
					setShowConfirmation(false);
					props.onClick.bind(undefined as never)(event);
				}}
			>
				confirm
			</button>
		</div>
	);
};

export const SelectInput: FunctionComponent<
	FieldProps & {
		value: string;
		onSelect: { (item: string): void };
		items: string[];
		descriptions?: string[];
		haveEmptyOption?: boolean;
		emptyOptionLabel?: string;
	}
> = (props) => {
	const { descriptions, items, haveEmptyOption, emptyOptionLabel } = props;

	return (
		<FieldWrapper {...props}>
			<select
				value={props.value}
				onChange={(event): void => {
					props.onSelect(eventToString(event));
				}}
			>
				{haveEmptyOption && (
					<option value="">{emptyOptionLabel ?? '(select)'}</option>
				)}
				{items.map((item, index) => (
					<option key={index} value={item}>
						{descriptions && descriptions[index] ? descriptions[index] : item}
					</option>
				))}
			</select>
		</FieldWrapper>
	);
};

export const SelectAndConfirmInput: FunctionComponent<
	FieldProps & {
		onSelect: { (item: string): void };
		items: string[];
		descriptions?: string[];
	}
> = (props) => {
	const { descriptions, items, onSelect } = props;
	const [value, setValue] = useState(items[0]);
	useEffect(() => {
		setValue(items[0]);
	}, [items]);

	return (
		<FieldWrapper {...props}>
			<SelectInput
				items={items}
				descriptions={descriptions}
				value={value || ''}
				onSelect={setValue}
			/>
			<button onClick={(): void => onSelect(value || '')}>CONFIRM</button>
		</FieldWrapper>
	);
};

export const Warning: FunctionComponent<{
	children?: ReactNode;
}> = (props) => {
	return (
		<>
			<b style={{ color: 'red' }}>!</b>
			{props.children}
			<b style={{ color: 'red' }}>!</b>
		</>
	);
};
