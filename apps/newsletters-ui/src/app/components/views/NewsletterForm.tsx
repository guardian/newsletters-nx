import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Grid, Select, TextField} from "@mui/material";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import type {IconButtonProps} from '@mui/material/IconButton';
import IconButton from '@mui/material/IconButton';
import MenuItem from "@mui/material/MenuItem";
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

const BasicDetailsForm = ({data, itemLabel}: BasicDetailsFormProps) => {
	const [formState, setFormState] = useState<NewsletterData>(data);

	const {listId, name, theme, status, category, emailConfirmation, group, frequency, identityName} = formState;


	const categoriesMap: {
		"article-based-legacy": string;
		"fronts-based": string;
		other: string;
		"manual-send": string;
		"article-based": string;
	} = {
		'article-based': 'Article Based',
		'article-based-legacy': 'Article Based (Legacy)',
		'fronts-based': 'Fronts Based',
		'manual-send': 'Manual Send',
		'other': 'Other',
	}

	const themeMap = {
		news: "News",
		opinion: "Opinion",
		culture: "Culture",
		sport: 'Sport',
		lifestyle: 'Lifestyle',
		features: 'Features',
	};

	return (<Grid
		component="form"
		container spacing={2}
	>
		<Grid item xs={12}>
			<TextField id="name" label="name" variant="outlined" defaultValue={name}/>
		</Grid>
		<Grid item xs={12}>
			<TextField
				error
				id="outlined-error-helper-text"
				label="Error"
				defaultValue="Hello World"
				helperText="Incorrect entry."
			/>
		</Grid>
		<Grid item xs={12}>
			<TextField id="theme" label="theme" variant="outlined" defaultValue={theme}/>
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
		<Grid item xs={12}>
			<Select
				labelId="theme"
				id="theme"
				value={theme}
				label="Age"
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
