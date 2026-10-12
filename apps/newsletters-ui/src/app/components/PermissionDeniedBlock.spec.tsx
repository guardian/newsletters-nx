import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createRoutesStub } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PermissionDeniedBlock } from './PermissionDeniedBlock';

const mockedNavigate = vi.fn();
vi.mock(import('react-router-dom'), async (importOriginal) => {
	const original = await importOriginal();

	return {
		...original,
		useNavigate: () => mockedNavigate,
	};
});

const makeStub = (element: ReactElement) => {
	return createRoutesStub([
		{
			path: '/test',
			Component: () => element,
		},
	]);
};

describe('PermissionDeniedBlock', () => {
	it('renders a custom title when provided', () => {
		const Stub = makeStub(
			<PermissionDeniedBlock title="You do not have the required permissions to edit a layout" />,
		);
		render(<Stub initialEntries={['/test']} />);

		const h1 = screen.getByRole('heading', { level: 1 });
		expect(h1.textContent).toBe(
			'You do not have the required permissions to edit a layout',
		);
	});

	describe('back button ', () => {
		it('renders custom button text when provided', () => {
			const Stub = makeStub(
				<PermissionDeniedBlock backText="Return to newsletters hub" />,
			);
			render(<Stub initialEntries={['/test']} />);

			const linkButton = screen.getByRole('link', {
				name: 'Return to newsletters hub',
			});

			expect(linkButton.textContent).toContain('Return to newsletters hub');
		});
	});

	it('it performs a browser history.back() call', () => {
		const Stub = makeStub(<PermissionDeniedBlock />);
		render(<Stub initialEntries={['/old-page', '/test']} />);

		const linkButton = screen.getByRole('link', {
			name: 'Return to previous page',
		});

		fireEvent.click(linkButton);
		expect(mockedNavigate).toHaveBeenCalledWith(-1);
	});
});
