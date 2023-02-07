import type { ColumnInstance } from 'react-table';

interface ColumnVisibilityProps {
	column: ColumnInstance;
}

export const ColumnVisibility = ({ column }: ColumnVisibilityProps) => {
	return (
		<div key={column.id}>
			<label>
				<input type="checkbox" {...column.getToggleHiddenProps()} />{' '}
				{column.Header as string}
			</label>
		</div>
	);
};
