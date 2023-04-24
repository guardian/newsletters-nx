import { TextField } from '@mui/material';
import { useState } from 'react';

type Props = {
	setGlobalFilter: (value: string) => void;
};

export const GlobalFilter = ({ setGlobalFilter }: Props) => {
	const [filterValue, setFilterValue] = useState<string>('');
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFilterValue(e.target.value || '');
		setGlobalFilter(e.target.value || '');
	};
	return (
		<TextField
			id="search-for-newsletters"
			label="Search for Newsletters"
			variant="outlined"
			onChange={handleChange}
			value={filterValue}
			fullWidth
		/>
	);
};
