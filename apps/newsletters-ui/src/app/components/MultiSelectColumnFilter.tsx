import {
	Checkbox,
	FormControl,
	InputLabel,
	ListItemText,
	MenuItem,
	Select,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useMemo } from 'react';
import type { FilterProps } from 'react-table';

type Props<TData extends object> = FilterProps<TData> & {
	label?: string;
};

export const MultiSelectColumnFilter = <TData extends object>({
	column,
	label,
}: Props<TData>) => {
	const { setFilter, preFilteredRows, id } = column;
	const filterValue = column.filterValue as string[] | [];

	const options = useMemo(() => {
		const optionSet = new Set<string>();

		preFilteredRows
			.map((row) => (row.values as Record<string, unknown>)[id])
			.filter(
				(cell): cell is string =>
					typeof cell === 'string' && cell.trim() !== '',
			)
			.forEach((cell) => optionSet.add(cell));

		return Array.from(optionSet).sort((a, b) => a.localeCompare(b));
	}, [id, preFilteredRows]);

	const value: string[] = Array.isArray(filterValue) ? filterValue : [];
	const selectLabel =
		label ?? (typeof column.Header === 'string' ? column.Header : 'Filter');
	const labelId = `${id}-filter-label`;

	const handleChange = (event: SelectChangeEvent<string[]>) => {
		const selected = event.target.value as string[];
		setFilter(selected.length ? selected : undefined);
	};

	if (!options.length) {
		return null;
	}

	return (
		<FormControl variant="outlined" size="small" fullWidth>
			<InputLabel id={labelId}>{selectLabel}</InputLabel>
			<Select
				labelId={labelId}
				multiple
				value={value}
				onChange={handleChange}
				label={selectLabel}
				renderValue={(selected) => selected.join(', ')}
			>
				{options.map((option) => (
					<MenuItem key={option} value={option}>
						<Checkbox checked={value.includes(option)} />
						<ListItemText primary={option} />
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};
