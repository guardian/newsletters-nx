import styled from "@emotion/styled";

const ButtonStyle = styled.div`
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
}

export function LargeButton({children}: LargeButtonProps) {
	return <ButtonStyle>{children}</ButtonStyle>
}
