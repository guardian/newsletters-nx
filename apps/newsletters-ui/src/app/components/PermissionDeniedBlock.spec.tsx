import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PermissionDeniedBlock } from './PermissionDeniedBlock';

describe('PermissionDeniedBlock', () => {
	it('renders a custom title when provided', () => {
		render(
			<PermissionDeniedBlock
				title="You do not have the required permissions to edit a layout"
				backTo=""
			/>,
		);

		const h1 = screen.getByRole('heading', { level: 1 });
		expect(h1.textContent).toBe(
			'You do not have the required permissions to edit a layout',
		);
	});

	it('renders custom button text when provided', () => {
		render(
			<PermissionDeniedBlock backText="Return to newsletters hub" backTo="" />,
		);

		const linkButton = screen.getByRole('link', {
			name: 'Return to newsletters hub',
		});

		expect(linkButton.textContent).toContain('Return to newsletters hub');
	});
	it('it allows overriding the link target', () => {
		render(<PermissionDeniedBlock backTo="/layouts" />);

		const linkButton = screen.getByRole('link', {
			name: 'Return to previous page',
		});
		expect(linkButton.getAttribute('href')).toBe('/layouts');
	});
});
