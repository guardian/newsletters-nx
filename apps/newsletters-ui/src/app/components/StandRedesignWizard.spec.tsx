import type { CurrentStepRouteResponse } from '@newsletters-nx/state-machine';
import { fireEvent, render, screen } from '@testing-library/react';
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

const renderWizard = (path: string) => {
	const router = createMemoryRouter(
		[{ path: '/drafts', children: standWizardRoutes }],
		{ initialEntries: [path] },
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

describe('Stand wizard step interactions', () => {
	it.each([
		['/drafts/newsletter-data/7', 'productionDetails'],
		['/drafts/newsletter-data-rendering/7', 'newsletterHeader'],
	])(
		'advances to the returned step without leaving %s',
		async (path, nextStep) => {
			const router = renderWizard(path);
			const next = await screen.findByRole('button', {
				name: 'Save and continue',
			});
			vi.mocked(makeWizardStepRequest).mockResolvedValueOnce(step(nextStep));
			await userEvent.click(next);
			expect(
				await screen.findByRole('heading', { name: nextStep }),
			).toBeVisible();
			expect(router.state.location.pathname).toBe(path);
		},
	);

	it('retains unsaved edits and buttons after a failed save', async () => {
		renderWizard('/drafts/newsletter-data/7');
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
		).toBeEnabled();
	});

	it('shows an initial request failure instead of a permanent loading state', async () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.mocked(makeWizardStepRequest).mockRejectedValueOnce(
			new Error('Offline'),
		);
		renderWizard('/drafts/newsletter-data/7');
		expect(await screen.findByRole('alert')).toHaveTextContent('Wizard failed');
		log.mockRestore();
	});
});
