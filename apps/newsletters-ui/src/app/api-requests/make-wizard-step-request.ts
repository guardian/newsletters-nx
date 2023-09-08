import { replaceUndefinedWithNull } from '@newsletters-nx/newsletters-data-client';
import type {
	CurrentStepRouteRequest,
	CurrentStepRouteResponse,
} from '@newsletters-nx/state-machine';

export const makeWizardStepRequest = async (
	body: CurrentStepRouteRequest,
): Promise<CurrentStepRouteResponse> => {
	const response = await fetch(`/api/currentstep`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body, replaceUndefinedWithNull),
	});

	return (await response.json()) as CurrentStepRouteResponse;
};
