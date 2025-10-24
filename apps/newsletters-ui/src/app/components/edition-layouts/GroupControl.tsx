import { ArrowBack, ArrowForward } from '@mui/icons-material';
import Add from '@mui/icons-material/Add';
import { Box, Button, Card, IconButton } from '@mui/material';
import type { Dispatch } from 'react';
import { Fragment } from 'react';
import type {
	LayoutGroup,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { StringInput } from '../SchemaForm/StringInput';
import { AnimatedContainer } from './AnimatedContainer';
import type { LayoutAction } from './layout-reducer';
import { NewsletterCard } from './NewsletterCard';

interface Props {
	dispatch: Dispatch<LayoutAction>;
	groupIndex: number;
	group: LayoutGroup;
	selectedNewsletter: string | undefined;
	newsletters: NewsletterData[];
}

export const GroupControl = ({
	dispatch,
	groupIndex,
	group,
	selectedNewsletter,
	newsletters,
}: Props) => {
	const InsertButton = ({ insertIndex }: { insertIndex: number }) => {
		return (
			<IconButton
				color="primary"
				size="large"
				aria-label="insert newsletter"
				disabled={
					!selectedNewsletter || group.newsletters.includes(selectedNewsletter)
				}
				onClick={() => {
					dispatch({ type: 'insert-newsletter', groupIndex, insertIndex });
				}}
			>
				<Add fontSize="large" />
			</IconButton>
		);
	};

	return (
		<Box
			key={groupIndex}
			padding={2}
			component={Card}
			sx={{ marginY: 1, backgroundColor: 'secondary.light' }}
		>
			<Box display={'flex'} flexWrap={'wrap'} gap={2}>
				<Box flex={1}>
					<StringInput
						label="Group Title"
						value={group.title}
						inputHandler={(title) =>
							dispatch({ type: 'update-group', groupIndex, mod: { title } })
						}
					/>
				</Box>
				<Box flex={1}>
					<StringInput
						optional
						label="subtitle"
						value={group.subtitle ?? ''}
						inputHandler={(subtitle) =>
							dispatch({ type: 'update-group', groupIndex, mod: { subtitle } })
						}
					/>
				</Box>
				<Button
					variant="contained"
					color="warning"
					onClick={() => dispatch({ type: 'delete-group', groupIndex })}
				>
					delete group
				</Button>
			</Box>
			<Box display={'flex'} flexWrap={'wrap'} gap={1} alignItems={'center'}>
				<AnimatedContainer
					list={group.newsletters}
					getId={(newsletterId) => newsletterId}
					represent={(newsletterId, newsletterIndex) => (
						<Fragment>
							<InsertButton insertIndex={newsletterIndex} />
							<Box>
								<Box display={'flex'} justifyContent={'space-between'}>
									<IconButton
										disabled={newsletterIndex === 0}
										onClick={() =>
											dispatch({
												type: 'move-newsletter-back',
												groupIndex,
												newsletterIndex,
											})
										}
									>
										<ArrowBack />
									</IconButton>
									<Button
										onClick={() =>
											dispatch({
												type: 'remove-newsletter',
												groupIndex,
												newsletterIndex,
											})
										}
									>
										remove
									</Button>
									<IconButton
										disabled={newsletterIndex + 1 >= group.newsletters.length}
										onClick={() =>
											dispatch({
												type: 'move-newsletter-forward',
												groupIndex,
												newsletterIndex,
											})
										}
									>
										<ArrowForward />
									</IconButton>
								</Box>
								<NewsletterCard
									noNumber
									size="small"
									newsletterId={newsletterId}
									index={newsletterIndex}
									newsletter={newsletters.find(
										(n) => n.identityName === newsletterId,
									)}
								/>
							</Box>
						</Fragment>
					)}
				/>
				<InsertButton insertIndex={group.newsletters.length} />
			</Box>
		</Box>
	);
};
