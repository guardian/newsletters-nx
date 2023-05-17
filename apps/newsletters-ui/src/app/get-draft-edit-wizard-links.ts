import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';

export type WizardLink = {
	label: string;
	href: string;
};
export const getEditDraftWizardLinks = (
	draft: DraftNewsletterData,
): WizardLink[] => {
	const { category, listId } = draft;

	const links: WizardLink[] = [];

	if (!listId) {
		return links;
	}

	links.push({
		label: 'Newsletter set-up',
		href: `/newsletters/newsletter-data/${listId.toString()}`,
	});

	if (category === 'article-based') {
		links.push({
			label: 'Article Rendering',
			href: `/newsletters/newsletter-data-rendering/${listId.toString()}`,
		});
	}

	return links;
};
