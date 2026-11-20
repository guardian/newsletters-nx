import type { CurrentStepRouteResponse } from '@newsletters-nx/state-machine';
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeWizardStepRequest } from '../api-requests/make-wizard-step-request';
import { StandRedesignWizardContainer } from './StandRedesignWizard';

vi.mock('../api-requests/make-wizard-step-request', () => ({
	makeWizardStepRequest: vi.fn(),
}));

const step = (currentStepId: string): CurrentStepRouteResponse => ({
	currentStepId,
	markdownToDisplay: `# ${currentStepId}`,
	formData: { listId: 7, name: 'Saved newsletter', frequency: 'Weekly' },
	buttons: {
		next: { id: 'next', buttonType: 'NEXT', label: 'Save and continue' },
	},
});

const base = '/drafts/newsletter-data';
const renderWizard = (...initialEntries: string[]) => {
	const router = createMemoryRouter(
		[
			{
				path: `${base}/:listId?/:stepSlug?`,
				element: (
					<StandRedesignWizardContainer wizardId="NEWSLETTER_DATA_STAND_REDESIGN" />
				),
			},
		],
		{ initialEntries },
	);
	render(<RouterProvider router={router} />);
	return router;
};

beforeEach(() => {
	vi.resetAllMocks();
	vi.mocked(makeWizardStepRequest).mockImplementation((request) =>
		Promise.resolve(step(request.stepId)),
	);
});

describe('Stand setup wizard step URLs', () => {
	it('opens a saved step directly and follows browser Back and Forward', async () => {
		const router = renderWizard(
			`${base}/7/name-and-frequency`,
			`${base}/7/production-details`,
		);
		expect(
			await screen.findByRole('heading', { name: 'productionDetails' }),
		).toBeInTheDocument();
		expect(makeWizardStepRequest).toHaveBeenCalledExactlyOnceWith({
			wizardId: 'NEWSLETTER_DATA_STAND_REDESIGN',
			id: '7',
			stepId: 'productionDetails',
		});
		await act(() => router.navigate(-1));
		expect(
			await screen.findByDisplayValue('Saved newsletter'),
		).toBeInTheDocument();
		await act(() => router.navigate(1));
		expect(
			await screen.findByRole('heading', { name: 'productionDetails' }),
		).toBeInTheDocument();
		expect(router.state.location.pathname).toBe(`${base}/7/production-details`);
	});

	it('updates the path after successful transitions without another request', async () => {
		const router = renderWizard(`${base}/7/name-and-frequency?example=1`);
		await screen.findByDisplayValue('Saved newsletter');
		vi.mocked(makeWizardStepRequest).mockResolvedValueOnce(
			step('productionDetails'),
		);
		await userEvent.click(
			screen.getByRole('button', { name: 'Save and continue' }),
		);
		await waitFor(() =>
			expect(router.state.location.pathname).toBe(
				`${base}/7/production-details`,
			),
		);
		expect(router.state.location.search).toBe('?example=1');
		expect(
			await screen.findByRole('heading', { name: 'productionDetails' }),
		).toBeInTheDocument();
		expect(makeWizardStepRequest).toHaveBeenCalledTimes(2);
	});

	it('keeps the current URL and edits after a failed save', async () => {
		const router = renderWizard(`${base}/7/name-and-frequency`);
		const input = await screen.findByDisplayValue('Saved newsletter');
		fireEvent.input(input, { target: { value: 'Unsaved edit' } });
		vi.mocked(makeWizardStepRequest).mockResolvedValueOnce({
			...step('nameAndFrequency'),
			formData: { listId: 7, name: 'Unsaved edit', frequency: 'Weekly' },
			errorMessage: 'Cannot save',
		});
		fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('Cannot save');
		expect(router.state.location.pathname).toBe(`${base}/7/name-and-frequency`);
		expect(screen.getByDisplayValue('Unsaved edit')).toBeInTheDocument();
	});

	it('retains the form and buttons when a save error has no step or form data', async () => {
		const router = renderWizard(`${base}/7/name-and-frequency`);
		fireEvent.input(await screen.findByDisplayValue('Saved newsletter'), {
			target: { value: 'Unsaved edit' },
		});
		vi.mocked(makeWizardStepRequest).mockResolvedValueOnce({
			currentStepId: '',
			errorMessage: 'Save failed',
			hasPersistentError: true,
		});
		await userEvent.click(
			screen.getByRole('button', { name: 'Save and continue' }),
		);
		expect(await screen.findByRole('alert')).toHaveTextContent('Save failed');
		expect(screen.getByDisplayValue('Unsaved edit')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: 'Save and continue' }),
		).toBeInTheDocument();
		expect(router.state.location.pathname).toBe(`${base}/7/name-and-frequency`);
	});

	it('asks before browser navigation discards changes', async () => {
		const router = renderWizard(
			`${base}/7/production-details`,
			`${base}/7/name-and-frequency`,
		);
		fireEvent.input(await screen.findByDisplayValue('Saved newsletter'), {
			target: { value: 'Unsaved edit' },
		});
		await act(() => router.navigate(-1));
		fireEvent.click(
			await screen.findByRole('button', { name: 'Stay on this step' }),
		);
		expect(screen.getByDisplayValue('Unsaved edit')).toBeInTheDocument();
		expect(makeWizardStepRequest).toHaveBeenCalledTimes(1);
		await act(() => router.navigate(-1));
		fireEvent.click(
			await screen.findByRole('button', { name: 'Discard changes and skip' }),
		);
		expect(
			await screen.findByRole('heading', { name: 'productionDetails' }),
		).toBeInTheDocument();
		expect(router.state.location.pathname).toBe(`${base}/7/production-details`);
	});

	it('retains old edit links and replaces them with the start step', async () => {
		const router = renderWizard(`${base}/7`);
		await waitFor(() =>
			expect(router.state.location.pathname).toBe(
				`${base}/7/name-and-frequency`,
			),
		);
		expect(router.state.historyAction).toBe('REPLACE');
		expect(makeWizardStepRequest).toHaveBeenCalledTimes(1);
	});

	it('creates the draft once and keeps subsequent saves on the create track', async () => {
		const request = vi.mocked(makeWizardStepRequest);
		request.mockResolvedValueOnce({
			...step('nameAndFrequency'),
			formData: {},
		});
		const router = renderWizard(`${base}/new/name-and-frequency`);
		const save = await screen.findByRole('button', {
			name: 'Save and continue',
		});
		request.mockClear();

		let finishFirstSave!: (response: CurrentStepRouteResponse) => void;
		const firstSave = new Promise<CurrentStepRouteResponse>((resolve) => {
			finishFirstSave = resolve;
		});
		request.mockReturnValueOnce(firstSave);
		await userEvent.dblClick(save);
		expect(request).toHaveBeenCalledTimes(1);

		await act(async () => {
			finishFirstSave(step('productionDetails'));
			await firstSave;
		});
		expect(router.state.location.pathname).toBe(`${base}/7/production-details`);
		expect(router.state.historyAction).toBe('REPLACE');

		request.mockResolvedValueOnce(step('dates'));
		await userEvent.click(
			screen.getByRole('button', { name: 'Save and continue' }),
		);
		const nextSave = request.mock.lastCall?.[0];
		expect(nextSave?.stepId).toBe('productionDetails');
		expect(nextSave?.id).toBeUndefined();
		expect(nextSave?.formData?.listId).toBe(7);
		expect(router.state.location.pathname).toBe(`${base}/7/dates`);
	});

	it('shows an unknown-step error without contacting the server', async () => {
		renderWizard(`${base}/7/unknown`);
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Unknown setup step',
		);
		expect(makeWizardStepRequest).not.toHaveBeenCalled();
	});

	it('shows an initial request failure instead of a permanent loading state', async () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.mocked(makeWizardStepRequest).mockRejectedValueOnce(
			new Error('Offline'),
		);
		renderWizard(`${base}/7/production-details`);
		expect(await screen.findByRole('alert')).toHaveTextContent('Wizard failed');
		log.mockRestore();
	});
});
