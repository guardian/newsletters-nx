import { Badge, Box, Grid, Stack, Typography } from '@mui/material';
import { type ReactNode } from 'react';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { RawDataDialog } from './RawDataDialog';

interface Props {
	newsletter: NewsletterData;
}

export const NewsletterDataDetails = ({ newsletter }: Props) => {
	const { status, name, category, identityName, listId } = newsletter;

	return (
		<Box>
			<Grid
				container
				columnGap={2}
				columnSpacing={2}
				justifyContent={'space-between'}
			>
				<Grid item>
					<Badge badgeContent={status} color="secondary">
						<Typography variant="h2">{name}</Typography>
					</Badge>
				</Grid>
				<Grid item>
					<Stack>
						<Typography variant="subtitle2">category: {category}</Typography>
						<Typography variant="subtitle2">
							identityName: {identityName}
						</Typography>
						<Typography variant="subtitle2">id number: {listId}</Typography>
					</Stack>
				</Grid>
			</Grid>

			<RawDataDialog newsletter={newsletter} />
		</Box>
	);
};
