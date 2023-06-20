import type { ButtonTypeMap } from '@mui/material';
import { Button, Tooltip } from '@mui/material';
import type { MouseEventHandler, ReactNode } from 'react';
import { useNavigate } from 'react-router';

type Props = ButtonTypeMap['props'] & {
	href?: string;
	toolTip?: string;
	children: ReactNode;
};

export const NavigateButton = (props: Props) => {
	const navigate = useNavigate();
	const { children, href, toolTip } = props;

	if (!href) {
		return (
			<Tooltip title={toolTip}>
				<span>
					<Button {...props} disabled>
						{children}
					</Button>
				</span>
			</Tooltip>
		);
	}

	const onClick: MouseEventHandler = (event) => {
		event.preventDefault();
		navigate(href);
	};

	return (
		<Tooltip title={toolTip}>
			<span>
				<Button {...props} onClick={onClick}>
					{children}
				</Button>
			</span>
		</Tooltip>
	);
};
