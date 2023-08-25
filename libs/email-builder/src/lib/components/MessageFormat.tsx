import type { ReactNode } from 'react';

interface Props {
	title: ReactNode;
	children: ReactNode;
}

export const MessageFormat = ({ title, children }: Props) => {
	return (
		<table width={'100%'}>
			<tbody>
				<tr>
					<th
						style={{
							backgroundColor: 'paleblue',
							borderBottom: '1px dotted red',
						}}
					>
						{title}
					</th>
				</tr>
				<tr>
					<td>{children}</td>
				</tr>
				<tr>
					<td>from the newsletters tool</td>
				</tr>
			</tbody>
		</table>
	);
};
