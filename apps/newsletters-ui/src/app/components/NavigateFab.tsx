import type { FabProps } from '@mui/material';
import { Fab } from '@mui/material';
import type { MouseEventHandler, ReactNode } from 'react';
import { useNavigate } from 'react-router';

type Props = FabProps & {
	href?: string;
	children: ReactNode;
};

export const NavigateFab = (props: Props) => {
	const navigate = useNavigate();
	const { children, href } = props;

	if (!href) {
		return (
			<Fab {...props} disabled>
				{children}
			</Fab>
		);
	}

	const onClick: MouseEventHandler = (event) => {
		event.preventDefault();
		navigate(href);
	};

	return (
		<Fab {...props} onClick={onClick}>
			{children}
		</Fab>
	);
};
