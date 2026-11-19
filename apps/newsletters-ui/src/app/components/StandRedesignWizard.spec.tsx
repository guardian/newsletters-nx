import type { CurrentStepRouteResponse } from '@newsletters-nx/state-machine';
import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
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
	const element = (
		<StandRedesignWizardContainer wizardId="NEWSLETTER_DATA_STAND_REDESIGN" />
	);
	const router = createMemoryRouter(
		[
			{ path: base, element },
			{ path: `${base}/:listId/:stepSlug?`, element },
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

describe('Stand setup step paths', () => {
	it('loads a step directly and follows browser Back and Forward', async () => {
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

	it('replaces the new-draft entry with its saved ID, then pushes successful step changes', async () => {
		vi.mocked(makeWizardStepRequest).mockResolvedValueOnce({
			...step('nameAndFrequency'),
			formData: {},
		});
		const router = renderWizard(`${base}/new/name-and-frequency`);
		await screen.findByRole('heading', { name: 'nameAndFrequency' });
		vi.mocked(makeWizardStepRequest).mockResolvedValueOnce(
			step('productionDetails'),
		);
		fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
		await waitFor(() =>
			expect(router.state.location.pathname).toBe(
				`${base}/7/production-details`,
			),
		);
		await screen.findByRole('heading', { name: 'productionDetails' });
		expect(router.state.historyAction).toBe('REPLACE');
		expect(makeWizardStepRequest).toHaveBeenCalledTimes(2);

		vi.mocked(makeWizardStepRequest).mockResolvedValueOnce(
			step('promotionDates'),
		);
		fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
		await waitFor(() =>
			expect(router.state.location.pathname).toBe(`${base}/7/promotion-dates`),
		);
		expect(router.state.historyAction).toBe('PUSH');
		expect(makeWizardStepRequest).toHaveBeenCalledTimes(3);
	});

	it('keeps failed validation on the same path and confirms discarding edits on Back', async () => {
		const router = renderWizard(
			`${base}/7/production-details`,
			`${base}/7/name-and-frequency`,
		);
		const input = await screen.findByDisplayValue('Saved newsletter');
		fireEvent.input(input, { target: { value: 'Unsaved edit' } });
		vi.mocked(makeWizardStepRequest).mockResolvedValueOnce({
			...step('nameAndFrequency'),
			formData: { listId: 7, name: 'Unsaved edit', frequency: 'Weekly' },
			errorMessage: 'Cannot save',
		});
		fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));
		await screen.findByRole('alert');
		expect(router.state.location.pathname).toBe(`${base}/7/name-and-frequency`);

		await act(() => router.navigate(-1));
		fireEvent.click(
			await screen.findByRole('button', { name: 'Stay on this step' }),
		);
		expect(screen.getByDisplayValue('Unsaved edit')).toBeInTheDocument();
		expect(makeWizardStepRequest).toHaveBeenCalledTimes(2);
		await act(() => router.navigate(-1));
		fireEvent.click(
			await screen.findByRole('button', { name: 'Discard changes and skip' }),
		);
		expect(
			await screen.findByRole('heading', { name: 'productionDetails' }),
		).toBeInTheDocument();
		expect(router.state.location.pathname).toBe(`${base}/7/production-details`);
	});

	it('replaces an old edit URL with the default step path', async () => {
		const router = renderWizard(`${base}/7`);
		await waitFor(() =>
			expect(router.state.location.pathname).toBe(
				`${base}/7/name-and-frequency`,
			),
		);
		expect(router.state.historyAction).toBe('REPLACE');
		expect(makeWizardStepRequest).toHaveBeenCalledTimes(1);
	});

	it('shows unknown steps without sending a request', async () => {
		renderWizard(`${base}/7/unknown`);
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Unknown setup step',
		);
		expect(makeWizardStepRequest).not.toHaveBeenCalled();
	});

	it('shows failed initialization instead of remaining on the loading screen', async () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.mocked(makeWizardStepRequest).mockRejectedValueOnce(
			new Error('Offline'),
		);
		renderWizard(`${base}/7/production-details`);
		expect(await screen.findByRole('alert')).toHaveTextContent('Wizard failed');
		log.mockRestore();
	});
});
