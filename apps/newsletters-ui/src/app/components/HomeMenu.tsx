import type {
	ButtonPropsColorOverrides,
	ButtonPropsVariantOverrides,
} from '@mui/material';
import { Button, Grid } from '@mui/material';
import { Container } from '@mui/system';
import type { OverridableStringUnion } from '@mui/types';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useLoaderData } from 'react-router-dom';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { usePermissions } from '../hooks/user-hooks';
import { shouldShowEditOptions } from '../services/authorisation';
import { ScrollingMenuButton } from './ScrollingMenuButton';

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
	const list = useLoaderData() as NewsletterData[];
	const permissions = usePermissions();
	const navigate = useNavigate();

	if (!permissions) return null;

	const showEditOptions = shouldShowEditOptions(permissions);

	return (
		<Container maxWidth={'lg'}>
			<Grid container spacing={3} rowSpacing={6} paddingY={4}>
				<ButtonGridItem
					path="/launched"
					content={'View launched newsletters'}
				/>
				<ButtonGridItem path="/drafts" content={'View draft newsletters'} />

				{permissions.writeToDrafts && (
					<ButtonGridItem
						path="/drafts/newsletter-data"
						content={'Create newsletter'}
						variant="contained"
					/>
				)}

				{showEditOptions && (
					<Grid item xs={6} sm={4} display={'flex'}>
						<ScrollingMenuButton
							buttonText="update newsletter"
							buttonProps={{
								variant: 'outlined',
								fullWidth: true,
								size: 'large',
							}}
							ariaMenuId="newsletter-update-menu"
							ariaButtonLabel="select newsletter to update"
							options={list.map((newsletter) => ({
								name: newsletter.name,
								id: newsletter.identityName,
							}))}
							handleSelect={(identityName) => {
								navigate(`/launched/edit/${identityName}`);
							}}
						/>
					</Grid>
				)}

				{permissions.editNewsletters && (
					<Grid item xs={6} sm={4} display={'flex'}>
						<ScrollingMenuButton
							buttonText="set rendering options"
							buttonProps={{
								variant: 'outlined',
								fullWidth: true,
								size: 'large',
							}}
							ariaMenuId="rendering-options-menu"
							ariaButtonLabel="select newsletter to set rendering options for"
							options={list.map((newsletter) => ({
								name: newsletter.name,
								id: newsletter.identityName,
							}))}
							handleSelect={(identityName) => {
								navigate(`/launched/rendering-options/${identityName}`);
							}}
						/>
					</Grid>
				)}

				<ButtonGridItem
					path="/layouts"
					content={'View Newsletter Layouts'}
					variant="outlined"
				/>
			</Grid>
		</Container>
	);
}
