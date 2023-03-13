export type StepListing = { id: string; label: string };

interface Props {
	currentStepId?: string;
	stepList: StepListing[];
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
						{step.label || step.id}
					</li>
				))}
			</ol>
		</nav>
	);
};
