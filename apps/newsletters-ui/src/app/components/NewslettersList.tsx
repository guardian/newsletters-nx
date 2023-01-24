import { Link } from "react-router-dom";

interface Props {
	list?: string[];
}

export const NewsletterList = ({ list }: Props) => {
	return (
		<nav>
			{list && (
				<ul>
					{list.map((item, index) => (
						<li key={index}><Link to={`/newsletters/${item}`}>{item}</Link></li>
					))}
				</ul>
			)}
		</nav>
	);
};
