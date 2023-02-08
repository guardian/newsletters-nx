import { css } from '@emotion/react';
import {
	headlineObjectStyles,
	neutral,
	space,
} from '@guardian/source-foundations';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { getPalette } from '../util';
import type { SourcePalette } from '../util';
import { Illustration } from './Illustration';
import { NewsletterPropertyTable } from './NewsletterPropertyTable';

interface Props {
	newsletter: Newsletter;
}

const headingRowStyles = (palette: SourcePalette) => css`
	display: flex;
	align-items: flex-end;

	h2 {
		${headlineObjectStyles.medium()};
		color: ${palette[100]};
		border-bottom: 2px solid ${palette[400]};
		margin: 0 ${space[6]}px ${space[3]}px 0;
	}

	div {
		display: 'inline-block';
		margin-right: ${space[3]}px;
		margin-bottom: ${space[3]}px;
		border-radius: ${space[3]}px;
		padding: ${space[2]}px ${space[4]}px;
		background-color: ${palette[600]};
		color: ${neutral[100]};
	}
`;

export const NewsletterDetail = ({ newsletter }: Props) => {
	const { name, theme, cancelled, paused, restricted } = newsletter;

	const palette = getPalette(theme);

	return (
		<div>
			<div css={headingRowStyles(palette)}>
				<h2>{name}</h2>
				{cancelled && <div>CANCELLED</div>}
				{paused && <div>PAUSED</div>}
				{restricted && <div>restricted</div>}
				{!paused && !cancelled && <div>LIVE</div>}
			</div>
			<Illustration newsletter={newsletter} />

			<NewsletterPropertyTable
				newsletter={newsletter}
				caption="Reference Properties"
				fields={[
					{ property: 'identityName' },
					{ property: 'listId' },
					{ property: 'listIdV1' },
				]}
			/>
			<NewsletterPropertyTable
				newsletter={newsletter}
				caption="Status Flags and Settings"
				fields={[
					{ property: 'cancelled' },
					{ property: 'paused' },
					{ property: 'paused' },
					{ property: 'restricted' },
				]}
			/>
			<NewsletterPropertyTable
				newsletter={newsletter}
				caption="Display and Information Properties"
				fields={[
					{ property: 'name' },
					{ property: 'theme' },
					{ property: 'description' },
					{ property: 'frequency' },
					{ property: 'regionFocus', defaultDisplayValue: '[NONE]' },
					{ property: 'group' },
					{ property: 'signupPage', displayValueAs: 'guardianLink' },
					{ property: 'exampleUrl', displayValueAs: 'guardianLink' },
				]}
			/>
			<NewsletterPropertyTable
				newsletter={newsletter}
				caption="Tracking Values"
				fields={[
					{ property: 'brazeNewsletterName' },
					{ property: 'brazeSubscribeAttributeName' },
					{ property: 'brazeSubscribeEventNamePrefix' },
					{ property: 'campaignName' },
					{ property: 'campaignCode' },
					{ property: 'brazeSubscribeAttributeNameAlternate' },
				]}
			/>
		</div>
	);
};
