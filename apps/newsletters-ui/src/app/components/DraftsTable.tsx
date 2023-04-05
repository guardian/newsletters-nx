import { Button } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { CircularProgressWithLabel } from './CircularProgressWithLabel';
import { DeleteDraftButton } from './DeleteDraftButton';
import { ExternalLinkButton } from './ExternalLinkButton';
import { NavigateButton } from './NavigateButton';
import { Table } from './Table';

interface Props {
	drafts: DraftNewsletterData[];
}
export const DraftsTable = ({ drafts }: Props) => {
	const [data, setData] = useState(
		drafts.map((draft) => ({
			...draft,
			wizardListId: draft['listId'],
			progress: Math.random() * 100,
		})),
	);
	const navigate = useNavigate();
	const columns = useMemo<Column[]>(
		() => [
			{
				Header: 'Draft ID number',
				accessor: 'listId',
				Cell: ({ cell: { value } }) => (
					<Link to={`./${value as string}`}>{value}</Link>
				),
			},
			{
				Header: 'Newsletter Name',
				accessor: 'name',
			},
			{
				Header: 'Design',
				accessor: 'figmaDesignUrl',
				Cell: ({ cell: { value } }) =>
					value ? (
						<ExternalLinkButton href={value as string} text="design" />
					) : null,
			},
			{
				Header: 'Pillar',
				accessor: 'theme',
				sortType: 'basic',
			},
			{
				Header: 'Progress',
				accessor: 'progress',
				Cell: ({ cell: { value } }) => (
					<CircularProgressWithLabel value={value as number} />
				),
			},
			{
				Header: 'Set up',
				Cell: ({ row: { original } }) => {
					const draft = original as DraftNewsletterData;
					const href = draft.listId
						? `/demo/newsletter-data/${draft.listId.toString()}`
						: undefined;
					return (
						<NavigateButton href={href} size="small">
							update
						</NavigateButton>
					);
				},
			},
			{
				Header: 'Render Options',
				Cell: ({ row: { original } }) => {
					const draft = original as DraftNewsletterData;
					const href = draft.listId
						? `/demo/newsletter-data-rendering/${draft.listId.toString()}`
						: undefined;
					return (
						<NavigateButton href={href} size="small">
							edit
						</NavigateButton>
					);
				},
			},
			{
				Header: 'delete',
				Cell: ({ row: { original } }) => {
					const draft = original as DraftNewsletterData;

					return (
						<DeleteDraftButton
							draft={draft}
							hasBeenDeleted={false}
							setHasBeenDeleted={() => {
								setData(
									data.filter((item) => item.wizardListId !== draft.listId),
								);
							}}
						/>
					);
				},
			},
		],
		[data, navigate],
	);
	return <Table data={data} columns={columns} defaultSortId="name" />;
};
