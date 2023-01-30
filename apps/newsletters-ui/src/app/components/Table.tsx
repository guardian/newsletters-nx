import { css } from '@emotion/react';
import { useTable } from 'react-table';
import type { Cell, Column } from 'react-table';

interface Props {
	data: object[];
	columns: Column[];
}

export const Table = ({ data, columns }: Props) => {
	const tableInstance = useTable({ columns, data });
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
		tableInstance;
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
		<table {...getTableProps()} css={tableStyle}>
			<thead>
				{headerGroups.map((headerGroup) => (
					<tr {...headerGroup.getFooterGroupProps()}>
						{headerGroup.headers.map((column) => (
							<th {...column.getHeaderProps()}>{column.render('Header')}</th>
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
								return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
							})}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};
