import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import type { Cell, Column } from 'react-table';
import { useSortBy, useTable } from 'react-table';
import { createColumnVisbilityObject } from './createColumnVisibilityObject';
import { createSearchStringFromObject } from './createSearchStringFromObject';

interface Props {
	data: object[];
	columns: Column[];
	defaultSortId?: string;
}

export const Table = ({ data, columns, defaultSortId }: Props) => {
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

	const [columnsVisibility, setColumnsVisibility] = useState<Record<string, boolean>>(createColumnVisbilityObject(data));
	const handleToggleColumn = (columnName: string) => {
		setColumnsVisibility({
			...columnsVisibility,
			[columnName]: !columnsVisibility[columnName],
		});
	};

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
									<input
										type="checkbox"
										checked={columnsVisibility[column.id]}
										onChange={() => handleToggleColumn(column.id)}
									/>
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
