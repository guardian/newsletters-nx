import type { ColumnInstance } from 'react-table';

interface ColumnHeaderProps {
	column: ColumnInstance;
}

export const ColumnHeader = ({ column }: ColumnHeaderProps) => {
	return (
		<th {...column.getHeaderProps(column.getSortByToggleProps())}>
			{column.render('Header')}
			<span>
				{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
			</span>
		</th>
	);
};
