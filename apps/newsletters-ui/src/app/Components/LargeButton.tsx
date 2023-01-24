import styled from '@emotion/styled';

const ButtonStyle = styled.button`
	border: 1px;
	border-style: solid;
	border-radius: 10px;
	padding: 20px 15px;
	margin: 20px;
	display: flex;
	justify-content: center;
	align-items: center;
`;

interface LargeButtonProps {
	children: React.ReactNode;
	onClick: () => void;
}

export function LargeButton({ children, onClick }: LargeButtonProps) {
	return <ButtonStyle onClick={onClick}>{children}</ButtonStyle>;
}
