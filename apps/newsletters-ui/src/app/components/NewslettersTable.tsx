import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { usePermissions } from '../hooks/user-hooks';
import { formatCellDate } from './Cell';
import { ExternalLinkButton } from './ExternalLinkButton';
import { NavigateButton } from './NavigateButton';
import { Table } from './Table';

interface Props {
	newsletters: NewsletterData[];
}

export const NewslettersTable = ({ newsletters }: Props) => {
	const { editNewsletters } = usePermissions() ?? {};
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
				Header: 'Category',
				accessor: 'category',
			},
			{
				Header: 'Design',
				accessor: 'figmaDesignUrl',
				disableSortBy: true,
				disableFilters: true,
				Cell: ({ cell: { value } }) =>
					value ? (
						<ExternalLinkButton href={value as string} text="design" />
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
				Header: 'Edit',
				Cell: ({ row: { original } }) => {
					const newsletter = original as NewsletterData;

					return (
						<NavigateButton
							toolTip={
								editNewsletters ? undefined : 'You do not have access to this'
							}
							href={
								editNewsletters
									? `/newsletters/edit/${newsletter.identityName}`
									: undefined
							}
							disabled={!editNewsletters}
						>
							Edit
						</NavigateButton>
					);
				},
			},
		],
		[],
	);
	return <Table data={data} columns={columns} defaultSortId="identityName" />;
};
