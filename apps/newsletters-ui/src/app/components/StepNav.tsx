import type { StepListing } from '@newsletters-nx/state-machine';

interface Props {
	currentStepId?: string;
	stepList: StepListing[];
	onEditTrack: boolean;
}

export const StepNav = ({ currentStepId, stepList, onEditTrack }: Props) => {
	const filteredStepList = stepList.filter((step) => {
		switch (step.role) {
			case 'CREATE_START':
				return !onEditTrack;
			case 'EDIT_START':
				return onEditTrack;
			case 'EARLY_EXIT':
				return false;
			default:
				return true;
		}
	});

	return (
		<nav>
			<ol>
				{filteredStepList.map((step) => (
					<li
						style={{
							fontWeight: step.id === currentStepId ? 'bold' : 'normal',
						}}
					>
						{step.label ?? step.id}
					</li>
				))}
			</ol>
		</nav>
	);
};
