import { Button } from '@mui/material';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { formatCellBoolean, formatCellDate } from './Cell';
import { Table } from './Table';

interface Props {
	newsletters: NewsletterData[];
}

export const NewslettersTable = ({ newsletters }: Props) => {
	const data = newsletters;
	const columns = useMemo<Column[]>(
		() => [
			{
				Header: 'Newsletter ID',
				accessor: 'identityName',
				Cell: ({ cell: { value } }) => (
					<Link to={`/newsletters/${value as string}`}>{value}</Link>
				),
			},
			{
				Header: 'Newsletter Name',
				accessor: 'name',
			},
			{
				Header: 'Design',
				accessor: 'designUrl',
				Cell: ({ cell: { value } }) =>
					value ? (
						<Button
							href={value as string}
							variant="outlined"
							target="_blank"
							endIcon={<span>↗</span>}
						>
							design
						</Button>
					) : null,
			},
			{
				Header: 'Pillar',
				accessor: 'theme',
			},
			{
				Header: 'Created',
				accessor: 'creationTimeStamp',
				Cell: formatCellDate,
			},
			{
				Header: 'Cancelled',
				accessor: 'cancellationTimeStamp',
				Cell: formatCellDate,
			},
			{
				Header: 'Status',
				accessor: 'status',
				sortType: 'basic',
			},
			{
				Header: 'Restricted',
				accessor: 'restricted',
				sortType: 'basic',
				Cell: formatCellBoolean,
			},
		],
		[],
	);
	return <Table data={data} columns={columns} defaultSortId="identityName" />;
};
