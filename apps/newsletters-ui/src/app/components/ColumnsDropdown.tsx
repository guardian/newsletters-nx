import { useState } from 'react';
import Select from 'react-select';
import type { ActionMeta, MultiValue } from 'react-select';
import type { Column } from 'react-table';

interface Props {
	columns: Column[];
}

type ColumnToSelect = {
	label: string;
	value: string;
};

function convertColumnsForDropdown(columns: Column[]): ColumnToSelect[] {
	return columns
		.filter((column) => column.Header)
		.map((column) => {
			const name = column.Header as string;
			const entry: ColumnToSelect = { label: name, value: name };
			return entry;
		});
}

function convertSelectedColumnsToColumnVisibility(
	selectedColumns: ColumnToSelect[],
	allColumns: Column[],
): Record<string, boolean> {
	return allColumns.reduce((acc: Record<string, boolean>, column) => {
		const name = column.id;
		if (name) {
			acc[name] = selectedColumns.some(
				(selectedColumn) => selectedColumn.value === name,
			);
		}

		return acc;
	}, {});
}

export const ColumnsDropdown = ({ columns }: Props) => {
	const [selectedColumns, setSelectedColumns] = useState<
		Record<string, boolean>
	>({});

	const handleChange = (
		selectedOptions: ColumnToSelect[],
		actionMeta: ActionMeta<ColumnToSelect>,
	) => {
		setSelectedColumns(
			convertSelectedColumnsToColumnVisibility(selectedOptions, columns),
		);
	};

	return (
		<Select
			options={convertColumnsForDropdown(columns)}
			isMulti
			value={convertColumnsForDropdown(selectedColumns)}
			onChange={handleChange}
		/>
	);
};
