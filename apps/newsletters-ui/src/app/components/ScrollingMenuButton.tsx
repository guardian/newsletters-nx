import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { ButtonProps } from '@mui/material';
import { Button, Menu, MenuItem } from '@mui/material';
import type { MouseEvent } from 'react';
import { useState } from 'react';

interface Props {
	buttonText: string;
	options: Array<{ label?: string; id: string }>;
	buttonProps?: ButtonProps;
	handleSelect: { (id: string): void };
	ariaMenuId: string;
	ariaButtonLabel?: string;
	maxItemsInView?: number;
}

const ITEM_HEIGHT = 48;

export function ScrollingMenuButton({
	buttonText,
	buttonProps = {},
	options,
	handleSelect,
	ariaMenuId,
	ariaButtonLabel = buttonText,
	maxItemsInView = 6.5,
}: Props) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const handleOptionClick = (id: string) => {
		handleClose();
		handleSelect(id);
	};

	const buttonId = `${ariaMenuId}-button`;

	return (
		<>
			<Button
				{...buttonProps}
				aria-label={ariaButtonLabel}
				id={buttonId}
				aria-controls={open ? ariaMenuId : undefined}
				aria-expanded={open ? 'true' : undefined}
				aria-haspopup="true"
				onClick={handleClick}
				endIcon={<MoreVertIcon />}
			>
				{buttonText}
			</Button>
			<Menu
				id={ariaMenuId}
				MenuListProps={{
					'aria-labelledby': buttonId,
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				PaperProps={{
					style: {
						maxHeight: ITEM_HEIGHT * maxItemsInView,
					},
				}}
			>
				{options.map((option) => (
					<MenuItem
						key={option.id}
						onClick={() => {
							handleOptionClick(option.id);
						}}
					>
						{option.label ?? option.id}
					</MenuItem>
				))}
			</Menu>
		</>
	);
}
