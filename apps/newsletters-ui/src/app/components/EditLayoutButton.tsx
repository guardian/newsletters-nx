import { LinkButton } from '@guardian/stand/LinkButton';
import { RouterProvider as AriaRouterProvider } from 'react-aria-components';
import { useHref, useNavigate } from 'react-router-dom';

interface EditLayoutButtonProps {
	editionId: string;
}

export const EditLayoutButton = ({ editionId }: EditLayoutButtonProps) => {
	const navigate = useNavigate();

	return (
		<AriaRouterProvider
			navigate={(path) => void navigate(path)}
			useHref={useHref}
		>
			<LinkButton
				href={`/layouts/edit/${editionId.toLowerCase()}`}
				variant="tertiary"
				size="sm"
				icon="edit"
			>
				Edit layout
			</LinkButton>
		</AriaRouterProvider>
	);
};
