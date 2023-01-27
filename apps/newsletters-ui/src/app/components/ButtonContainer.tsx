import { Button, Tooltip } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { space, until } from '@guardian/source-foundations';
import { Link } from 'react-router-dom';

const ContainerStyle = styled.div`
	display: grid;
	grid-template-columns: auto auto auto;
	column-gap: ${space[6]}px;
	row-gap: ${space[2]}px;
	${until.tablet} {
		grid-template-columns: auto auto;
	}
	${until.mobileLandscape} {
		grid-template-columns: auto;
	}
`;

type DisabledButtonProps = { children: string; tooltipLabel?: string };
const DisabledButton = ({
	children,
	tooltipLabel = 'Not implemented yet',
}: DisabledButtonProps) => (
	<Tooltip label={tooltipLabel}>
		<Button
			style={{
				cursor: 'not-allowed',
				color: 'grey',
				background: 'none',
			}}
			variant="ghost"
		>
			{children}
		</Button>
	</Tooltip>
);

export function ButtonContainer() {
	return (
		<ContainerStyle>
			<Button>
				<Link to="/newsletters">View current newsletters</Link>
			</Button>

			<DisabledButton>Create newsletter</DisabledButton>

			<DisabledButton>Update newsletter</DisabledButton>

			<DisabledButton>View email templates</DisabledButton>

			<DisabledButton>Create email template</DisabledButton>

			<DisabledButton>Update email template</DisabledButton>

			<DisabledButton>View all thrashers</DisabledButton>

			<DisabledButton>Create single thrasher</DisabledButton>

			<DisabledButton>Create multi thrasher</DisabledButton>
		</ContainerStyle>
	);
}
