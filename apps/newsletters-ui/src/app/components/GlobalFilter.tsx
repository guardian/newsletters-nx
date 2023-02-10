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
		<span>
			Search:&nbsp;
			<input
				value={filterValue}
				onChange={handleChange}
				placeholder={`Filter data...`}
			/>
		</span>
	);
};
