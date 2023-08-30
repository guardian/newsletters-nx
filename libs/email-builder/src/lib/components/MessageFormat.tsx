import type { ReactNode } from 'react';

interface Props {
	title: ReactNode;
	children: ReactNode;
}

export const MessageFormat = ({ title, children }: Props) => {
	return (
		<div>
			<header>
				<h1>{title}</h1>
				<p>Hello</p>
				<p>
					<em>This is an automated message from the newsletters tool.</em>
				</p>
			</header>
			<div>{children}</div>
			<footer>
				<p>Thank you</p>
				<p>The Newsletters Team</p>
			</footer>
		</div>
	);
};
