import type { ButtonTypeMap } from '@mui/material';
import { Button } from '@mui/material';
import type { MouseEventHandler, ReactNode } from 'react';
import { useNavigate } from 'react-router';

type Props = ButtonTypeMap['props'] & {
	href?: string;
	children: ReactNode;
};

export const NavigateButton = (props: Props) => {
	const navigate = useNavigate();
	const { children, href } = props;

	if (!href) {
		return (
			<Button {...props} disabled>
				{children}
			</Button>
		);
	}

	const onClick: MouseEventHandler = (event) => {
		event.preventDefault();
		navigate(href);
	};

	return (
		<Button {...props} role="link" onClick={onClick}>
			{children}
		</Button>
	);
};
