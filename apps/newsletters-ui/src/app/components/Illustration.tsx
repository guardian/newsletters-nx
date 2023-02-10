import { css } from '@emotion/react';
import { brand, space } from '@guardian/source-foundations';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';

interface Props {
	newsletter: Newsletter;
}

const figureStyles = css`
	display: inline-flex;
	margin: 0;
	border: 2px dashed ${brand[400]};
	border-radius: ${space[2]}px;
	padding: ${space[1]}px;
	flex-direction: column;
	align-items: center;

	span {
		font-size: 100px;
	}
`;

export const Illustration = ({ newsletter }: Props) => {
	const { illustration, name } = newsletter;

	if (!illustration) {
		return (
			<figure css={figureStyles}>
				<span role="img" aria-label="no illustration">
					🚫
				</span>
				<figcaption>{name} has no illustration</figcaption>
			</figure>
		);
	}

	return (
		<figure css={figureStyles}>
			<img src={illustration.circle} alt="" height={100} />
			<figcaption>illustration for {name}</figcaption>
		</figure>
	);
};
