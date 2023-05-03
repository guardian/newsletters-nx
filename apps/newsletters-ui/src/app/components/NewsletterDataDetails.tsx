import { Badge, Box, Divider, Grid, Stack, Typography } from '@mui/material';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { RawDataDialog } from './RawDataDialog';

interface Props {
	newsletter: NewsletterData;
}

const propertyDisplayValue = (value: unknown): string => {
	switch (typeof value) {
		case 'string':
		case 'number':
		case 'bigint':
		case 'boolean':
		case 'symbol':
			return value.toString();
		case 'undefined':
			return '[UNDEFINED]';
		case 'object':
			return '[OBJECT]';
		case 'function':
			return value.toString();
	}
};

export const NewsletterDataDetails = ({ newsletter }: Props) => {
	const { status, name, category, identityName, listId } = newsletter;

	const DataPoint = (props: {
		label?: string;
		property: keyof NewsletterData;
	}) => {
		const { label, property } = props;
		const value = newsletter[props.property];

		const displayValue = propertyDisplayValue(value);

		return (
			<Grid container justifyContent={'space-between'} spacing={1}>
				<Grid item xs={2}>
					<Typography variant="caption">{label ?? property}</Typography>
				</Grid>
				<Grid item xs={10}>
					<Typography>{displayValue}</Typography>
				</Grid>
			</Grid>
		);
	};

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

			<Box>
				<Typography variant="h3">Copy</Typography>
				<DataPoint property="signUpHeadline" />
				<DataPoint property="signUpDescription" />
				<DataPoint
					property="signUpEmbedDescription"
					label="confirmation message"
				/>
			</Box>

			<Divider />
			<RawDataDialog record={newsletter} title={newsletter.identityName} />
		</Box>
	);
};
