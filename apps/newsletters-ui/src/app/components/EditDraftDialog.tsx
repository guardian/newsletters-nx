import {
	ButtonGroup,
	Dialog,
	DialogContent,
	DialogContentText,
} from '@mui/material';
import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { NavigateButton } from './NavigateButton';

interface Props {
	draft?: DraftNewsletterData;
	close: { (): void };
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

export const EditDraftDialog = ({ draft, close }: Props) => {
	const links = draft ? getLinks(draft) : [];

	return (
		<Dialog onClose={close} open={!!draft}>
			{draft && (
				<DialogContent>
					<DialogContentText>Options to edit {draft.name}</DialogContentText>
					<ButtonGroup orientation="vertical" fullWidth>
						{links.map((link) => (
							<NavigateButton key={link.href} href={link.href} fullWidth>
								{link.label}
							</NavigateButton>
						))}
					</ButtonGroup>
					<DialogContentText>Category: {draft.category}</DialogContentText>
				</DialogContent>
			)}
		</Dialog>
	);
};
