import { useState } from 'react';
import Select from 'react-select';
import type { ActionMeta, MultiValue } from 'react-select';
import type { Column } from 'react-table';

interface Props {
	columns: ColumnToSelect[];
}

type ColumnToSelect = {
	label: string;
	value: string;
};

export function getAvailableColumns(columns: Column[]): ColumnToSelect[] {
	return columns
		.filter((column) => column.Header)
		.map((column) => {
			const name = column.Header as string;
			const entry: ColumnToSelect = { label: name, value: name };
			return entry;
		});
}

export const ColumnsDropdown = ({ columns }: Props) => {
	const [selectedColumns, setSelectedColumns] = useState<ColumnToSelect[]>([]);

	const handleChange = (
		selectedOptions: MultiValue<ColumnToSelect>,
		actionMeta: ActionMeta<ColumnToSelect>,
	) => {
		setSelectedColumns(selectedOptions as ColumnToSelect[]);
	};

	return (
		<Select
			options={columns}
			isMulti
			value={selectedColumns}
			onChange={handleChange}
		/>
	);
};
