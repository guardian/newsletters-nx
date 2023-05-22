import { useLoaderData } from 'react-router-dom';
import type { RenderingTemplate } from '../../loaders/rendering-templates';
import { TemplateList } from '../TemplateList';

export const TemplateListView = () => {
	const list = useLoaderData();
	if (!list || !Array.isArray(list)) {
		return <nav>NO LIST</nav>;
	}

	return <TemplateList templates={list as RenderingTemplate[]} />;
};
