import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import type { Cell, Column } from 'react-table';
import { useSortBy, useTable } from 'react-table';
import { ColumnsDropdown, convertColumnsForDropdown } from '../ColumnsDropdown';
import { createColumnVisbilityObject } from './createColumnVisibilityObject';
import { createSearchStringFromObject } from './CreateSearchStringFromObject';

interface Props {
	data: object[];
	columns: Column[];
	defaultColumnVisibility: Record<string, boolean>;
	defaultSortId?: string;
}

function createColumnVisibilityMap(
	columns: Column[],
	availableColumns: Column[],
) {
	const columnVisibilityMap = new Map<string, boolean>();
	columns.forEach((column) => {
		const columnName = column.Header as string;
		const columnIsAvailable = availableColumns.some(
			(availableColumn) => availableColumn.Header === columnName,
		);
		columnVisibilityMap.set(columnName, columnIsAvailable);
	});
	return columnVisibilityMap;
}

export const Table = ({
	data,
	columns,
	defaultColumnVisibility,
	defaultSortId,
}: Props) => {
	const [filterText, setFilterText] = useState('');
	const [filteredData, setFilteredData] = useState<object[]>([]);
	useEffect(() => {
		setFilteredData(
			data.filter((d) =>
				createSearchStringFromObject(d)
					.toLowerCase()
					.includes(filterText.toLowerCase()),
			),
		);
	}, [data, filterText]);

	const [columnsVisibility, setColumnsVisibility] = useState<
		Record<string, boolean>
	>(defaultColumnVisibility);

	const initialState = defaultSortId
		? { sortBy: [{ id: defaultSortId, desc: false }] }
		: {};
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
		useTable({ columns, data: filteredData, initialState }, useSortBy);

	const tableStyle = css`
		border-collapse: collapse;
		th,
		td {
			border: 1px solid #dddddd;
			padding: 8px;
			text-align: left;
		}
	`;
	return (
		<>
			<span>
				Select columns to display:{' '}
				<ColumnsDropdown
					columns={columns}
					onChange={(visibleColumns) => setColumnsVisibility(visibleColumns)}
				/>
			</span>
			<input
				type="text"
				placeholder="Filter data"
				value={filterText}
				onChange={(e) => setFilterText(e.target.value)}
			/>
			<table {...getTableProps()} css={tableStyle}>
				<thead>
					{headerGroups.map((headerGroup) => (
						<tr {...headerGroup.getHeaderGroupProps()}>
							{headerGroup.headers.map((column) => (
								<th {...column.getHeaderProps(column.getSortByToggleProps())}>
									{column.render('Header')}
									<span>
										{column.isSorted
											? column.isSortedDesc
												? ' 🔽'
												: ' 🔼'
											: ''}
									</span>
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody {...getTableBodyProps()}>
					{rows.map((row) => {
						prepareRow(row);
						return (
							<tr {...row.getRowProps()}>
								{row.cells.map((cell: Cell, index) => {
									if (!columnsVisibility[cell.column.id]) {
										return null;
									}
									return (
										<td {...cell.getCellProps()}>{cell.render('Cell')}</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		</>
	);
};
