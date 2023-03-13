import type { StepListing } from '@newsletters-nx/state-machine';

interface Props {
	currentStepId?: string;
	stepList: StepListing[];
	onEditTrack: boolean;
}

export const StepNav = ({ currentStepId, stepList }: Props) => {
	return (
		<nav>
			<ol>
				{stepList.map((step) => (
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
