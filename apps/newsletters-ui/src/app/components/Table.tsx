import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import type { Cell, Column, TableOptions } from 'react-table';
import { useSortBy, useTable } from 'react-table';

interface TableData extends Object {
	name: string;
}
interface Props {
	data: TableData[];
	columns: Column[];
	defaultSortId?: string;
}

export const Table = ({ data, columns, defaultSortId }: Props) => {
	const [filterText, setFilterText] = useState('');
	const [filteredData, setFilteredData] = useState<TableData[]>([]);
	useEffect(() => {
		setFilteredData(
			data.filter((d: { name: string }) =>
				d.name.toLowerCase().includes(filterText.toLowerCase())
			),
		)
	}, [data, filterText]);
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
			<input
				type="text"
				placeholder="Filter data by name"
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
