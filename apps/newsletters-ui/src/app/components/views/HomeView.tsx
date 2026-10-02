import { baseColors } from '@guardian/stand';
import { Layout as StandLayout } from '@guardian/stand/Layout';
import { Typography } from '@guardian/stand/Typography';
import { mainStyle, pageStyle, titleStyle } from '../home/home.styles';
import { NewsletterPanel } from '../home/NewsletterPanel';

export const HomeView = () => (
	<StandLayout.Main cssOverrides={mainStyle}>
		<Typography element="h1" variant="titleXl" cssOverrides={titleStyle}>
			Welcome to the Newsletters tool
		</Typography>
		<div css={pageStyle}>
			<NewsletterPanel
				title="Draft newsletters"
				background={baseColors.yellow[800]}
				emptyText="No draft newsletters"
			/>
			<NewsletterPanel
				title="Launched newsletters"
				background={baseColors.green[800]}
				emptyText="No launched newsletters"
			/>
		</div>
	</StandLayout.Main>
);
