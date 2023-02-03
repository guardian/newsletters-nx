import { css } from '@emotion/react';
import type { Cell, Column } from 'react-table';
import { useGlobalFilter, useSortBy, useTable } from 'react-table';
import { GlobalFilter } from './GlobalFilter';

interface Props {
	data: object[];
	columns: Column[];
	defaultSortId?: string;
}

export const Table = ({ data, columns, defaultSortId }: Props) => {
	const initialState = defaultSortId
		? { sortBy: [{ id: defaultSortId, desc: false }] }
		: {};

	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		rows,
		prepareRow,
		allColumns,
		preGlobalFilteredRows,
		setGlobalFilter,
	} = useTable({ columns, data, initialState }, useGlobalFilter, useSortBy);

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
			<div>Hide/Show Columns</div>
			<div>
				{allColumns.map((column) => (
					<div key={column.id}>
						<label>
							<input type="checkbox" {...column.getToggleHiddenProps()} />{' '}
							{column.Header as string}
						</label>
					</div>
				))}
			</div>
			<GlobalFilter
				preGlobalFilteredRows={preGlobalFilteredRows}
				setGlobalFilter={setGlobalFilter}
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
