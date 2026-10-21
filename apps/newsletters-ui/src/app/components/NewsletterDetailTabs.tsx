import { css } from '@emotion/react';
import { semanticColors } from '@guardian/stand';
import { Tabs } from '@guardian/stand/Tabs';
import { useNavigate } from 'react-router-dom';

type TabKey = 'details' | 'layout';

interface Props {
	identityName: string;
	selected: TabKey;
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

// Driven by the route: selecting a tab navigates, so the URL changes and Back
// works. Layout links to the existing preview until the Layout tab is built.
export const NewsletterDetailTabs = ({ identityName, selected }: Props) => {
	const navigate = useNavigate();
	const id = encodeURIComponent(identityName);

	return (
		<div css={barStyles}>
			<Tabs
				selectedKey={selected}
				onSelectionChange={(key) => {
					if (key === selected) {
						return;
					}
					void navigate(
						key === 'layout'
							? `/launched/preview/${id}`
							: `/newsletters/${id}/details`,
					);
				}}
			>
				<Tabs.TabList aria-label="Newsletter sections">
					<Tabs.Tab id="details" cssOverrides={firstTabStyles}>
						Details
					</Tabs.Tab>
					<Tabs.Tab id="layout">Layout</Tabs.Tab>
				</Tabs.TabList>
			</Tabs>
		</div>
	);
};
