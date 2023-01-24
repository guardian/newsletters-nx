import styled from "@emotion/styled";

const ButtonStyle = styled.button`
	border: 1px;
	border-style: solid;
	padding: 20px 20px;
	margin: 20px;
	display: flex;
	justify-content: center;
	text-align: center;
`

interface LargeButtonProps {
	children: React.ReactNode;
	onClick: () => void;
}

export function LargeButton({children, onClick}: LargeButtonProps) {
	return <ButtonStyle onClick={onClick}>{children}</ButtonStyle>
}
