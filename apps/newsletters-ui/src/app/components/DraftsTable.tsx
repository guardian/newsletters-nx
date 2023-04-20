import { Button, IconButton } from '@mui/material';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Column } from 'react-table';
import {
	calculateProgress,
	type DraftNewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { CircularProgressWithLabel } from './CircularProgressWithLabel';
import { DeleteDraftButton } from './DeleteDraftButton';
import { EditDraftDialog } from './EditDraftDialog';
import { ExternalLinkButton } from './ExternalLinkButton';
import { Table } from './Table';

interface Props {
	drafts: DraftNewsletterData[];
}
export const DraftsTable = ({ drafts }: Props) => {
	const [draftInDialog, setDraftInDialog] = useState<
		DraftNewsletterData | undefined
	>(undefined);
	const [data, setData] = useState(
		drafts.map((draft) => ({
			...draft,
			wizardListId: draft['listId'],
			progress: calculateProgress(draft),
		})),
	);
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
				Header: 'Category',
				accessor: 'category',
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
				Header: 'Edit',
				Cell: ({ row: { original } }) => {
					const draft = original as DraftNewsletterData;

					return (
						<Button
							onClick={() => {
								setDraftInDialog(draft);
							}}
							startIcon={'⚙'}
							variant="outlined"
						>
							Edit
						</Button>
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
		[data],
	);
	return (
		<>
			<Table data={data} columns={columns} defaultSortId="name" />;
			<EditDraftDialog
				draft={draftInDialog}
				close={() => {
					setDraftInDialog(undefined);
				}}
			/>
		</>
	);
};
