import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {FormControlLabel, Grid, Radio, Select, TextField} from "@mui/material";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import type {IconButtonProps} from '@mui/material/IconButton';
import IconButton from '@mui/material/IconButton';
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from '@mui/material/RadioGroup';
import {styled} from '@mui/material/styles';
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

interface ItemCardProps {
	title: string;
	formContent: ReactNode;
}

const ItemCard = ({title, formContent}: ItemCardProps) => {
	const [expanded, setExpanded] = useState(true);

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
			<Collapse in={expanded} timeout="auto" unmountOnExit>
				<CardContent>
					{formContent}
				</CardContent>
			</Collapse>
			<CardActions disableSpacing>
			</CardActions>
		</Card>
	);
}

interface BasicDetailsFormProps {
	data: NewsletterData;
	itemLabel: string;
}

const categoriesMap: Record<string,string> = {
	'article-based': 'Article Based',
	'article-based-legacy': 'Article Based (Legacy)',
	'fronts-based': 'Fronts Based',
	'manual-send': 'Manual Send',
	'other': 'Other',
}

const themeMap : Record<string,string> = {
	news: "News",
	opinion: "Opinion",
	culture: "Culture",
	sport: 'Sport',
	lifestyle: 'Lifestyle',
	features: 'Features',
};

const BasicDetailsForm = ({data}: BasicDetailsFormProps) => {
	const [formState, setFormState] = useState<NewsletterData>(data);

	const {listId, name, theme, status, category, emailConfirmation, group, frequency, identityName} = formState;

	console.log('staus', status)
	return (<Grid
		component="form"
		container spacing={2}
	>
		<Grid item xs={12}>
			<TextField id="name" label="name" variant="outlined" defaultValue={name}/>
		</Grid>
		<Grid item xs={12}>
			<TextField id="theme" label="theme" variant="outlined" defaultValue={theme}/>
		</Grid>
		<Grid item xs={12}>
			<TextField id="frequency" label="theme" variant="outlined" defaultValue={frequency}/>
		</Grid>
		<Grid item xs={12}>
			<RadioGroup
				aria-labelledby="demo-radio-buttons-group-label"
				defaultValue={status}
				name="radio-buttons-group"
			>
				<FormControlLabel value="paused" control={<Radio />} label="Paused" />
				<FormControlLabel value="cancelled" control={<Radio />} label="Cancelled" />
				<FormControlLabel value="live" control={<Radio />} label="Live" />
			</RadioGroup>
		</Grid>

		<Grid item xs={12}>
			<Select
				labelId="category"
				id="category"
				value={category}
				label="Age"
				onChange={({target: {value: category}}) => {
					setFormState({...formState, category})
				}}
			>
				{Object.keys(categoriesMap).map((key) => <MenuItem key={key} value={key}>{categoriesMap[key]}</MenuItem>)}
			</Select>
		</Grid>
		{category === 'article-based' &&
			<Grid item xs={12}>

				SET ALL THE RENDERING OPTIONS
			</Grid>
		}

		<Grid item xs={12}>
			<Select
				labelId="pillar"
				id="theme"
				value={theme}
				label="pillar"
				onChange={({target: {value: theme}}) => {
					setFormState({...formState, theme})
				}}
			>
				{Object.keys(themeMap).map((key) => <MenuItem key={key} value={key}>{themeMap[key]}</MenuItem>)}
			</Select>
		</Grid>
	</Grid>);
}


export const NewsletterForm = () => {
	const newsletterData = useLoaderData();
	// const [item, setItem] = useState(newsletterData);
	return (<div style={{flexDirection: 'row', display: 'flex'}}>
		<ContentWrapper>
			<ItemCard title="Basic Details"
								formContent={<BasicDetailsForm data={newsletterData as NewsletterData} itemLabel="Basic Details"/>}/>
		</ContentWrapper>
		<SideNav/>
	</div>)
}
