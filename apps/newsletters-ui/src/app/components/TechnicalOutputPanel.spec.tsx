import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { allowEditing, newsletterFixture } from '../../test-utils/newsletter';
import { panel, valueFor } from '../../test-utils/newsletter-detail-page';
import { TechnicalOutputPanel } from './TechnicalOutputPanel';

vi.mock('../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));

beforeEach(() => {
	vi.resetAllMocks();
	allowEditing();
});

const renderPanel = (overrides: Partial<NewsletterData> = {}) => {
	const user = userEvent.setup();
	const newsletter = newsletterFixture({
		identityName: 'afternoon-update',
		restricted: false,
		...overrides,
	});
	render(<TechnicalOutputPanel newsletter={newsletter} />);
	return { user, newsletter };
};

const technicalOutput = () => panel('Technical output');

const brazeTemplate = () =>
	screen
		.getByRole('group', { name: 'Braze campaign template code' })
		.querySelector('pre')?.textContent;

describe('TechnicalOutputPanel', () => {
	it('shows the identifiers', () => {
		renderPanel({ restricted: true });

		expect(valueFor('id number')).toBe('123');
		expect(valueFor('Identity name')).toBe('afternoon-update');
		expect(valueFor('Restricted')).toBe('true');
	});

	it('shows restricted as false', () => {
		renderPanel({ restricted: false });

		expect(valueFor('Restricted')).toBe('false');
	});

	it('has no Edit action, even for editors', () => {
		renderPanel();

		expect(
			technicalOutput().queryByRole('button', { name: 'Edit' }),
		).not.toBeInTheDocument();
	});

	it('has no Raw data action, even for editors', () => {
		renderPanel();

		expect(
			technicalOutput().queryByRole('button', { name: 'show raw data' }),
		).not.toBeInTheDocument();
	});

	it('copies the sign-up embed code', async () => {
		const { user } = renderPanel();
		const embedCode = screen.getByRole('group', { name: 'Sign up embed code' });

		await user.click(within(embedCode).getByRole('button', { name: 'Copy' }));

		const copied = await navigator.clipboard.readText();
		expect(copied).toContain('<iframe id="afternoon-update"');
		expect(copied).toBe(embedCode.querySelector('pre')?.textContent);
		expect(within(embedCode).getByRole('status')).toHaveTextContent(
			'Copied to clipboard',
		);
	});

	it('says when the code could not be copied', async () => {
		const { user } = renderPanel();
		vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
			new Error('Not allowed'),
		);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const embedCode = screen.getByRole('group', { name: 'Sign up embed code' });

		await user.click(within(embedCode).getByRole('button', { name: 'Copy' }));

		expect(within(embedCode).getByRole('status')).toHaveTextContent(
			"Couldn't copy",
		);
	});

	it('explains what the embed code is for', async () => {
		const { user } = renderPanel();
		const embedCode = screen.getByRole('group', { name: 'Sign up embed code' });

		await user.hover(
			within(embedCode).getByRole('button', { name: 'Information' }),
		);

		expect(await screen.findByRole('tooltip')).toHaveTextContent(
			'The HTML code to paste into a composer embed block to add a sign-up form to the article content.',
		);
	});

	it.each([
		{ regionFocus: 'AU', slotKey: 'AUS' },
		{ regionFocus: 'US', slotKey: 'US' },
		{ regionFocus: 'UK', slotKey: 'Newsletters' },
	] as const)(
		'uses the $slotKey slot set by default for region focus $regionFocus',
		({ regionFocus, slotKey }) => {
			renderPanel({ regionFocus });

			expect(screen.getByRole('radio', { name: 'Default' })).toBeChecked();
			expect(brazeTemplate()).toContain(`Logic_Header_${slotKey}`);
			expect(brazeTemplate()).toContain(`Logic_Middle_${slotKey}`);
			expect(brazeTemplate()).toContain(`Logic_Footer_${slotKey}`);
		},
	);

	it('uses the chosen slot set', async () => {
		const { user } = renderPanel({ regionFocus: 'UK' });

		for (const [slotSet, slotKey] of [
			['Australia', 'AUS'],
			['US', 'US'],
			['Global', 'Newsletters'],
		]) {
			await user.click(screen.getByRole('radio', { name: slotSet }));

			expect(brazeTemplate()).toContain(`Logic_Header_${slotKey}`);
			expect(brazeTemplate()).toContain(`Logic_Middle_${slotKey}`);
			expect(brazeTemplate()).toContain(`Logic_Footer_${slotKey}`);
		}
	});

	it('copies the Braze template for the chosen slot set', async () => {
		const { user } = renderPanel({ regionFocus: 'UK' });
		const template = screen.getByRole('group', {
			name: 'Braze campaign template code',
		});

		await user.click(screen.getByRole('radio', { name: 'Australia' }));
		await user.click(within(template).getByRole('button', { name: 'Copy' }));

		const copied = await navigator.clipboard.readText();
		expect(copied).toContain('Logic_Header_AUS');
		expect(copied).not.toContain('Logic_Header_Newsletters');
		expect(copied).toBe(brazeTemplate());
	});
});
