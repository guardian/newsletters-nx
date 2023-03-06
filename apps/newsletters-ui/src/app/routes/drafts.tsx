import { Container } from '@mui/material';
import type { RouteObject } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { DraftDetailView } from '../components/views/DraftDetailView';
import { DraftListView } from '../components/views/DraftListView';
import type { WizardProps } from '../components/Wizard';
import { Wizard } from '../components/Wizard';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { draftDetailLoader, draftListLoader } from '../loaders/newsletters';

const WizardLink: React.FC<WizardProps> = ({ wizardId, id }: WizardProps) => {
	const { listId } = useParams();
	return (
		<Container>
			<Wizard wizardId={wizardId} id={listId} />
		</Container>
	);
};

export const draftRoute: RouteObject = {
	path: '/newsletters/drafts',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <DraftListView />,
			loader: draftListLoader,
		},
		{
			path: ':id',
			element: <DraftDetailView />,
			loader: draftDetailLoader,
		},
	],
};
