import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import {Grid, TextField} from "@mui/material";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import type {IconButtonProps} from '@mui/material/IconButton';
import IconButton from '@mui/material/IconButton';
import {styled} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type {ReactNode} from "react";
import {useState} from "react";
import {useLoaderData} from "react-router-dom";
import type {NewsletterData} from "@newsletters-nx/newsletters-data-client";
import {ContentWrapper} from "../../ContentWrapper";
import {SideNav} from "../SideNav";

interface ExpandMoreProps extends IconButtonProps {
	expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
	const {expand, ...other} = props;
	return <IconButton {...other} />;
})(({theme, expand}) => ({
	transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
	marginLeft: 'auto',
	transition: theme.transitions.create('transform', {
		duration: theme.transitions.duration.shortest,
	}),
}));

interface RecipeReviewCardProps {
	title: string;
	formContent: ReactNode;
}

const RecipeReviewCard = ({title, formContent}: RecipeReviewCardProps) => {
	const [expanded, setExpanded] = useState(false);

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};

	return (
		<Card>
			<CardHeader
				action={
					<ExpandMore
						expand={expanded}
						onClick={handleExpandClick}
						aria-expanded={expanded}
						aria-label="show more"
					>
						<ExpandMoreIcon/>
					</ExpandMore>
				}
				title={title}
			/>
			{/*<CardContent>*/}
			{/*	<Typography variant="body2" color="text.secondary">*/}
			{/*		This impressive paella is a perfect party dish and a fun meal to cook*/}
			{/*		together with your guests. Add 1 cup of frozen peas along with the mussels,*/}
			{/*		if you like.*/}
			{/*	</Typography>*/}
			{/*</CardContent>*/}
			<Collapse in={expanded} timeout="auto" unmountOnExit>
				<CardContent>
					{formContent}
				</CardContent>
			</Collapse>
			<CardActions disableSpacing>
				{/*<IconButton aria-label="add to favorites">*/}
				{/*	<FavoriteIcon/>*/}
				{/*</IconButton>*/}
				{/*<IconButton aria-label="share">*/}
				{/*	<ShareIcon/>*/}
				{/*</IconButton>*/}
			</CardActions>
		</Card>
	);
}

interface BasicDetailsFormProps {
	data: NewsletterData;
}

const BasicDetailsForm = ({data: {name}}: BasicDetailsFormProps) => {
	return (<Grid
		component="form"
		container spacing={2}
	>
		<Grid item xs={12}>
			<TextField id="name" label="Name" variant="outlined" value={name}/>
		</Grid>
	</Grid>);
}


export const NewsletterForm = () => {
	const newsletterData = useLoaderData();
	const [item, setItem] = useState(newsletterData);
	return (<div style={{flexDirection: 'row', display: 'flex'}}>
		<ContentWrapper>
			{['Name', 'Production Category', 'Promotions', 'Pillar & Group'].map((title, key) => <RecipeReviewCard key={key}
																																																						 title={title}
																																																						 formContent={
																																																							 <BasicDetailsForm
																																																								 data={newsletterData as NewsletterData}/>}/>)}
		</ContentWrapper>
		<SideNav/>
	</div>)
}
