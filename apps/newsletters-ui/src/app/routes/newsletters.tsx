import type { RouteObject } from 'react-router-dom';
import { NewsletterDetailView } from '../components/views/NewsletterDetailView';
import { NewsletterEditView } from '../components/views/NewsletterEditView';
import { NewsletterJsonEditView } from '../components/views/NewsletterJsonEditView';
import { NewslettersListView } from '../components/views/NewslettersListView';
import { PreviewView } from '../components/views/PreviewView';
import { RenderingOptionsView } from '../components/views/RenderingOptionsView';
import { WizardContainer } from '../components/WizardContainer';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { detailLoader, listLoader } from '../loaders/newsletters';

export const newslettersRoute: RouteObject = {
	path: '/newsletters',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <NewslettersListView />,
			loader: listLoader,
		},
		{
			path: ':id',
			element: <NewsletterDetailView />,
			loader: detailLoader,
		},
		{
			path: 'edit/:id',
			element: <NewsletterEditView />,
			loader: detailLoader,
		},
		{
			path: 'rendering-options/:id',
			element: <RenderingOptionsView />,
			loader: detailLoader,
		},
		{
			path: 'edit-json/:id',
			element: <NewsletterJsonEditView />,
			loader: detailLoader,
		},
		{
			path: 'newsletter-data/:listId',
			element: <WizardContainer wizardId="NEWSLETTER_DATA" />,
		},
		{
			path: 'newsletter-data-rendering/:listId',
			element: <WizardContainer wizardId="RENDERING_OPTIONS" />,
		},
		{
			path: 'newsletter-data',
			element: <WizardContainer wizardId="NEWSLETTER_DATA" />,
		},
		{
			path: 'launch-newsletter/:listId',
			element: <WizardContainer wizardId="LAUNCH_NEWSLETTER" />,
		},
		{
			path: 'launch-newsletter',
			element: <WizardContainer wizardId="LAUNCH_NEWSLETTER" />,
		},

		{
			path: 'preview/:id',
			element: <PreviewView />,
			loader: detailLoader,
		},
	],
};
