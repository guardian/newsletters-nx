import { StandErrorBlock } from './StandErrorBlock';

type Stand404Props = {
	title?: string;
	backText?: string;
};
export const Stand404Block = ({
	title = 'The page you are looking for cannot be found',
	backText = 'Return to previous page',
}: Stand404Props) => {
	return <StandErrorBlock title={title} backText={backText} />;
};
