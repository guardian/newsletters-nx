import type {
	ButtonPropsColorOverrides,
	ButtonPropsVariantOverrides,
} from '@mui/material';
import { Button, Grid } from '@mui/material';
import { Container } from '@mui/system';
import type { OverridableStringUnion } from '@mui/types';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';

const ButtonGridItem = ({
	path,
	content,
	color = 'primary',
	variant = 'outlined',
}: {
	path?: string;
	content: ReactNode;
	color?: OverridableStringUnion<
		| 'secondary'
		| 'inherit'
		| 'primary'
		| 'success'
		| 'error'
		| 'info'
		| 'warning',
		ButtonPropsColorOverrides
	>;
	variant?: OverridableStringUnion<
		'text' | 'outlined' | 'contained',
		ButtonPropsVariantOverrides
	>;
}) => {
	const navigate = useNavigate();

	const buttonProps = {
		onClick: path ? () => navigate(path) : undefined,
		disabled: !path,
		color,
		variant,
	};

	return (
		<Grid item xs={6} sm={4} display={'flex'}>
			<Button {...buttonProps} fullWidth size="large">
				{content}
			</Button>
		</Grid>
	);
};

export function HomeMenu() {
	return (
		<Container maxWidth={'lg'}>
			<Grid container spacing={3} rowSpacing={6} paddingY={2}>
				<ButtonGridItem
					path="/newsletters"
					content={'View current newsletters'}
				/>
				<ButtonGridItem path="/drafts" content={'View draft newsletters'} />
				<ButtonGridItem
					path="/newsletters/create"
					content={'Create new newsletter'}
				/>
				<ButtonGridItem
					path="/newsletters/newsletter-data"
					content={'Create newsletter wizard'}
					color="success"
					variant="contained"
				/>
				<ButtonGridItem path="/newsletters/forms" content={'Demo form'} />
				<ButtonGridItem content={'Update newsletter'} />
			</Grid>
		</Container>
	);
}
