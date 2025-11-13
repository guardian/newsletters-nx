import type { ButtonTypeMap } from '@mui/material';
import { Button } from '@mui/material';
import type { MouseEventHandler, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';

type LocationState = {
	from?: string;
};

type Props = ButtonTypeMap['props'] & {
	href?: string;
	children: ReactNode;
	backTo?: string;
};

export const NavigateButton = (props: Props) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { children, href, backTo } = props;

	if (!href && !backTo) {
		return (
			<Button {...props} disabled>
				{children}
			</Button>
		);
	}

	const onClick: MouseEventHandler = (event) => {
		event.preventDefault();

		const state = location.state as LocationState | null;

		if (
			href?.startsWith('..') &&
			state?.from &&
			location.pathname.includes(state.from)
		) {
			navigate(-1);
		} else if (href) {
			navigate(href);
		} else if (backTo) {
			navigate(backTo);
		}
	};

	return (
		<Button {...props} role="link" onClick={onClick}>
			{children}
		</Button>
	);
};
