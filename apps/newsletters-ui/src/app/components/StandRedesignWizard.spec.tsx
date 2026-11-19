import type { CurrentStepRouteResponse } from '@newsletters-nx/state-machine';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeWizardStepRequest } from '../api-requests/make-wizard-step-request';
import { StandRedesignWizardContainer } from './StandRedesignWizard';

vi.mock('../api-requests/make-wizard-step-request', () => ({
	makeWizardStepRequest: vi.fn(),
}));

const initialStep: CurrentStepRouteResponse = {
	currentStepId: 'nameAndFrequency',
	markdownToDisplay: '# Name and frequency',
	formData: { listId: 7, name: 'Saved newsletter', frequency: 'Weekly' },
};

const renderWizard = (url: string) =>
	render(
		<MemoryRouter initialEntries={[url]}>
			<Routes>
				<Route
					path="/drafts/newsletter-data/:listId?"
					element={
						<StandRedesignWizardContainer wizardId="NEWSLETTER_DATA_STAND_REDESIGN" />
					}
				/>
			</Routes>
		</MemoryRouter>,
	);

beforeEach(() => vi.resetAllMocks());

describe('StandRedesignWizard resume', () => {
	it('loads the saved draft then displays its first incomplete step', async () => {
		let finishResume: (value: CurrentStepRouteResponse) => void = () => {
			throw new Error('Resume request has not started');
		};
		vi.mocked(makeWizardStepRequest)
			.mockResolvedValueOnce(initialStep)
			.mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						finishResume = resolve;
					}),
			);

		renderWizard('/drafts/newsletter-data/7?resume=true');
		await waitFor(() => expect(makeWizardStepRequest).toHaveBeenCalledTimes(2));
		expect(makeWizardStepRequest).toHaveBeenNthCalledWith(1, {
			wizardId: 'NEWSLETTER_DATA_STAND_REDESIGN',
			id: '7',
			stepId: 'nameAndFrequency',
		});
		expect(makeWizardStepRequest).toHaveBeenNthCalledWith(2, {
			wizardId: 'NEWSLETTER_DATA_STAND_REDESIGN',
			id: '7',
			stepId: 'nameAndFrequency',
			stepToSkipToId: 'productionDetails',
			formData: initialStep.formData,
		});
		// Do not briefly display an editable start step while the resume request runs.
		expect(
			screen.queryByRole('heading', { name: 'Name and frequency' }),
		).toBeNull();
		finishResume({
			...initialStep,
			currentStepId: 'productionDetails',
			markdownToDisplay: '# Resume production details',
		});
		expect(
			await screen.findByRole('heading', { name: 'Resume production details' }),
		).toBeInTheDocument();
		expect(makeWizardStepRequest).toHaveBeenCalledTimes(2);
	});

	it.each(['', '?resume=false'])(
		'keeps ordinary edit links at the start (%s)',
		async (query) => {
			vi.mocked(makeWizardStepRequest).mockResolvedValue(initialStep);
			renderWizard(`/drafts/newsletter-data/7${query}`);
			expect(
				await screen.findByRole('heading', { name: 'Name and frequency' }),
			).toBeInTheDocument();
			expect(screen.getByDisplayValue('Saved newsletter')).toBeInTheDocument();
			expect(makeWizardStepRequest).toHaveBeenCalledTimes(1);
		},
	);

	it('keeps new drafts at the introduction even with a resume query', async () => {
		vi.mocked(makeWizardStepRequest).mockResolvedValue({
			currentStepId: 'intro',
			markdownToDisplay: '# New draft introduction',
		});
		renderWizard('/drafts/newsletter-data?resume=true');
		expect(
			await screen.findByRole('heading', { name: 'New draft introduction' }),
		).toBeInTheDocument();
		expect(makeWizardStepRequest).toHaveBeenCalledTimes(1);
		expect(makeWizardStepRequest).toHaveBeenCalledWith({
			wizardId: 'NEWSLETTER_DATA_STAND_REDESIGN',
			stepId: 'intro',
		});
	});
});
