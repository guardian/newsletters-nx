import { ButtonGroup } from '@mui/material';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { NavigateButton } from './NavigateButton';

interface Props {
	draft: DraftNewsletterData;
}

type WizardLink = {
	label: string;
	href: string;
};
const getLinks = (draft: DraftNewsletterData): WizardLink[] => {
	const { category, listId } = draft;

	const links: WizardLink[] = [];

	if (!listId) {
		return links;
	}

	links.push({
		label: 'Newsletter set-up',
		href: `/demo/newsletter-data/${listId.toString()}`,
	});

	if (category === 'article-based') {
		links.push({
			label: 'Article Rendering',
			href: `/demo/newsletter-data-rendering/${listId.toString()}`,
		});
	}

	return links;
};

export const EditDraftNavigateButtons = ({ draft }: Props) => {
	return (
		<>
			{getLinks(draft).map((link) => (
				<NavigateButton key={link.href} href={link.href}>
					{link.label}
				</NavigateButton>
			))}
		</>
	);
};
