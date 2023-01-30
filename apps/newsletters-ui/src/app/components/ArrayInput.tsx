interface Props {
	data: string[];
	label: string;
	change: { (data: string[]): void };

	validationWarning?: string;
}
export const ArrayInput = ({
	data,
	change,
	validationWarning,
	label,
}: Props) => {
	const handleInput = (
		event: React.ChangeEvent<HTMLInputElement>,
		index: number,
	) => {
		const dataCopy = [...data];
		dataCopy[index] = event.target.value;
		change(dataCopy);
	};

	const handleDelete = (index: number) => {
		const dataCopy = [...data];
		dataCopy.splice(index, 1);
		change(dataCopy);
	};

	const handleAdd = () => {
		const dataCopy = [...data, ''];
		change(dataCopy);
	};

	return (
		<fieldset>
			<legend>
				{label} ({data.length} items)
			</legend>
			{validationWarning && <b>!{validationWarning}</b>}

			{data.map((item, index) => (
				<div key={index}>
					<input value={item} onChange={(event) => handleInput(event, index)} />
					<button
						onClick={() => {
							handleDelete(index);
						}}
					>
						x
					</button>
				</div>
			))}

			<div>
				<button
					onClick={() => {
						handleAdd();
					}}
				>
					+
				</button>
			</div>
		</fieldset>
	);
};
