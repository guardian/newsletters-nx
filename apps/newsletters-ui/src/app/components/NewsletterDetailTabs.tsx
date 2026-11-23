import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Tabs } from '@guardian/stand/Tabs';
import { useNavigate } from 'react-router-dom';
import { newsletterLayoutPath } from '../lib/newsletter-layout';

type TabKey = 'details' | 'layout';

interface Props {
	identityName: string;
	selected: TabKey;
	showLayout?: boolean;
}

// Full-width bar behind the tabs, as in the design.
const barStyles = css`
	background-color: ${semanticColors.bg.raisedLevel1};
	border-bottom: 1px solid ${semanticColors.border.weak};
`;

// Stand adds a left border to the first tab; this design does not want it.
const firstTabStyles = css`
	&&:first-of-type {
		border-left: none;
	}
`;

// Driven by the route so the address and browser history follow the tab selection.
export const NewsletterDetailTabs = ({
	identityName,
	selected,
	showLayout = true,
}: Props) => {
	const navigate = useNavigate();

	return (
		<div css={barStyles}>
			<Tabs
				selectedKey={selected}
				onSelectionChange={(key) => {
					if (key === selected) {
						return;
					}
					void navigate(
						newsletterLayoutPath(
							identityName,
							key === 'layout' ? 'layout' : 'details',
						),
					);
				}}
			>
				<Tabs.TabList aria-label="Newsletter sections">
					<Tabs.Tab id="details" cssOverrides={firstTabStyles}>
						Details
					</Tabs.Tab>
					{showLayout && <Tabs.Tab id="layout">Layout</Tabs.Tab>}
				</Tabs.TabList>
			</Tabs>
		</div>
	);
};
