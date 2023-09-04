import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { usePermissions } from '../hooks/user-hooks';
import { shouldShowEditOptions } from '../services/authorisation';
import { formatCellDate, formatStatusCell } from './Cell';
import { ExternalLinkButton } from './ExternalLinkButton';
import { NavigateButton } from './NavigateButton';
import { Table } from './Table';

interface Props {
	newsletters: NewsletterData[];
}

export const NewslettersTable = ({ newsletters }: Props) => {
	const permissions = usePermissions();
	const showEditOptions = shouldShowEditOptions(permissions);
	const data = newsletters;

	const columns = useMemo<Column[]>(() => {
		const infoColumns: Column[] = [
			{
				Header: 'Newsletter ID',
				accessor: 'identityName',
				Cell: ({ cell: { value } }) => (
					<Link to={`/launched/${value as string}`}>{value}</Link>
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
				Header: 'Status',
				accessor: 'status',
				sortType: 'basic',
				Cell: formatStatusCell,
			},
		];

		const editColumn: Column = {
			Header: 'Edit',
			Cell: ({ row: { original } }) => {
				const newsletter = original as NewsletterData;

				return (
					<NavigateButton
						href={
							showEditOptions
								? `/launched/edit/${newsletter.identityName}`
								: undefined
						}
					>
						Edit
					</NavigateButton>
				);
			},
		};

		return showEditOptions ? [...infoColumns, editColumn] : infoColumns;
	}, [showEditOptions]);
	return <Table data={data} columns={columns} defaultSortId="identityName" />;
};
