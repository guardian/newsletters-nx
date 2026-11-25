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
import { standWizardRoutes } from '../routes/stand-wizard';

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
		[{ path: '/drafts', children: standWizardRoutes }],
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

	it('keeps unsaved edits when only the query string changes', async () => {
		const router = renderWizard(`${base}/7/name-and-frequency`);
		fireEvent.input(await screen.findByDisplayValue('Saved newsletter'), {
			target: { value: 'Unsaved edit' },
		});

		await act(() => router.navigate('?switch-legacy=false'));

		expect(router.state.location.search).toBe('?switch-legacy=false');
		expect(screen.getByDisplayValue('Unsaved edit')).toBeInTheDocument();
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
		await userEvent.click(
			await screen.findByRole('button', { name: 'Stay on this step' }),
		);
		expect(screen.getByDisplayValue('Unsaved edit')).toBeInTheDocument();
		expect(makeWizardStepRequest).toHaveBeenCalledTimes(1);
		await act(() => router.navigate(-1));
		await userEvent.click(
			await screen.findByRole('button', { name: 'Discard changes' }),
		);
		await waitFor(() =>
			expect(
				screen.getByRole('heading', { name: 'productionDetails' }),
			).toBeVisible(),
		);
		expect(router.state.location.pathname).toBe(`${base}/7/production-details`);
	});

	it('retains old edit links and replaces them with the start step', async () => {
		const router = renderWizard(`${base}/7?example=value`);
		await screen.findByDisplayValue('Saved newsletter');
		expect(router.state.location.pathname).toBe(`${base}/7/name-and-frequency`);
		expect(router.state.location.search).toBe('?example=value');
		await userEvent.click(
			screen.getByRole('button', { name: /Newsletter creation steps/ }),
		);
		expect(screen.getByRole('button', { name: 'Introduction' })).toBeEnabled();
		expect(router.state.historyAction).toBe('REPLACE');
	});

	it('creates the draft once and loads the next step using its saved ID', async () => {
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

		// Keep the first save pending so the second click tests the duplicate-request guard.
		let resolveFirstSave!: (response: CurrentStepRouteResponse) => void;
		const firstSaveResponse = new Promise<CurrentStepRouteResponse>(
			(resolve) => {
				resolveFirstSave = resolve;
			},
		);
		request.mockReturnValueOnce(firstSaveResponse);
		await userEvent.dblClick(save);
		expect(request).toHaveBeenCalledTimes(1);

		await act(async () => {
			resolveFirstSave({
				currentStepId: 'productionDetails',
				formData: { listId: 7 },
			});
			await firstSaveResponse;
		});
		await screen.findByRole('heading', { name: 'productionDetails' });
		expect(request.mock.lastCall?.[0]).toMatchObject({
			id: '7',
			stepId: 'productionDetails',
		});
		expect(router.state.location.pathname).toBe(`${base}/7/production-details`);
		expect(router.state.historyAction).toBe('REPLACE');
	});

	it('shows an unknown-step error without contacting the server', async () => {
		renderWizard(`${base}/7/unknown`);
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Unknown setup step',
		);
		expect(makeWizardStepRequest).not.toHaveBeenCalled();
	});

	it.each([
		{
			wizard: 'rendering options',
			path: '/drafts/newsletter-data-rendering/7',
			nextStepId: 'newsletterHeader',
		},
		{
			wizard: 'launch',
			path: '/drafts/launch-newsletter/7',
			nextStepId: 'isDataComplete',
		},
	])('advances $wizard in place', async ({ path, nextStepId }) => {
		const router = renderWizard(path);
		const next = await screen.findByRole('button', {
			name: 'Save and continue',
		});
		const { key } = router.state.location;
		vi.mocked(makeWizardStepRequest).mockResolvedValueOnce(step(nextStepId));
		await userEvent.click(next);
		expect(
			await screen.findByRole('heading', { name: nextStepId }),
		).toBeVisible();
		expect(router.state.location).toMatchObject({ pathname: path, key });
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
