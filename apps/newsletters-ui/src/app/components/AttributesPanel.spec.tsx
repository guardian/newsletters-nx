import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	allowEditing,
	mockPermissions,
	newsletterFixture,
	viewerPermissions,
} from '../../test-utils/newsletter';
import { valueFor } from '../../test-utils/newsletter-detail-page';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { AttributesPanel } from './AttributesPanel';

vi.mock('../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));
vi.mock('../api-requests/request-newsletter-edit', () => ({
	requestNewsletterEdit: vi.fn(),
}));

const original = newsletterFixture();

beforeEach(() => {
	vi.resetAllMocks();
	allowEditing();
});

const edit = () =>
	fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
const saveButton = () => screen.getByRole('button', { name: 'Save changes' });
const statusRadio = (name: string) =>
	within(
		screen.getByRole('radiogroup', { name: 'Newsletter status' }),
	).getByRole('radio', { name });
const customFrequency = () =>
	screen.getByRole('textbox', { name: 'Custom frequency' });
/** Stand selects render a button named "<selected option> <label>". */
const selectButton = (label: string) =>
	screen.getByRole('button', { name: new RegExp(`${label}$`) });
const choose = async (label: string, option: string) => {
	await userEvent.click(selectButton(label));
	await userEvent.click(await screen.findByRole('option', { name: option }));
};

describe('AttributesPanel', () => {
	it('shows the current values in the editor', () => {
		render(<AttributesPanel newsletter={original} />);
		edit();
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
			original.name,
		);
		expect(
			within(screen.getByRole('radiogroup', { name: 'Newsletter status' }))
				.getAllByRole('radio')
				.map((radio) => radio.getAttribute('value')),
		).toEqual(['pending', 'live', 'paused', 'cancelled']);
		expect(statusRadio('Live')).toBeChecked();
		expect(selectButton('Pillar')).toHaveTextContent('News');
		expect(selectButton('Region focus')).toHaveTextContent('AU');
		expect(selectButton('Frequency')).toHaveTextContent('Weekly');
		expect(
			screen.queryByRole('textbox', { name: 'Custom frequency' }),
		).not.toBeInTheDocument();
		expect(selectButton('MMA group')).toHaveTextContent('News in depth');
	});

	it('shows the type of newsletter but does not allow editing it', () => {
		render(<AttributesPanel newsletter={original} />);
		edit();
		expect(selectButton('Type of newsletter')).toHaveTextContent(
			'Article based',
		);
		expect(selectButton('Type of newsletter')).toBeDisabled();
	});

	it('saves the edited attributes and reports the saved newsletter', async () => {
		const saved = {
			...original,
			name: 'Renamed',
			status: 'paused' as const,
			frequency: 'Monthly',
		};
		vi.mocked(requestNewsletterEdit).mockResolvedValue({
			ok: true,
			total: 1,
			data: saved,
		});
		const onSaved = vi.fn();
		render(<AttributesPanel newsletter={original} onSaved={onSaved} />);
		edit();
		fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
			target: { value: '  Renamed ' },
		});
		fireEvent.click(statusRadio('Paused'));
		await choose('Pillar', 'Sport');
		await choose('Frequency', 'Monthly');
		fireEvent.click(saveButton());
		await screen.findByRole('button', { name: 'Edit' });

		expect(requestNewsletterEdit).toHaveBeenCalledWith(123, {
			name: 'Renamed',
			status: 'paused',
			theme: 'sport',
			regionFocus: original.regionFocus,
			frequency: 'Monthly',
			group: original.group,
		});
		expect(onSaved).toHaveBeenCalledWith(saved);
		expect(valueFor('Name')).toBe('Renamed');
		expect(valueFor('Newsletter status')).toBe('Paused');
		expect(valueFor('Frequency')).toBe('Monthly');
	});

	it('shows an existing frequency that is not an option as custom', () => {
		render(
			<AttributesPanel
				newsletter={newsletterFixture({ frequency: 'Tuesdays and Fridays' })}
			/>,
		);
		edit();
		expect(selectButton('Frequency')).toHaveTextContent(
			'Custom (please specify)',
		);
		expect(customFrequency()).toHaveValue('Tuesdays and Fridays');
	});

	it('offers the frequencies used by existing newsletters', () => {
		render(
			<AttributesPanel
				newsletter={newsletterFixture({ frequency: 'Fortnightly' })}
			/>,
		);
		edit();
		expect(selectButton('Frequency')).toHaveTextContent('Fortnightly');
		expect(
			screen.queryByRole('textbox', { name: 'Custom frequency' }),
		).not.toBeInTheDocument();
	});

	it('saves a custom frequency, and needs one to save', async () => {
		vi.mocked(requestNewsletterEdit).mockResolvedValue({
			ok: true,
			total: 1,
			data: original,
		});
		render(<AttributesPanel newsletter={original} />);
		edit();
		await choose('Frequency', 'Custom (please specify)');
		expect(customFrequency()).toHaveValue('');
		expect(screen.getByText('Enter a frequency')).toBeVisible();
		expect(saveButton()).toBeDisabled();
		fireEvent.change(customFrequency(), {
			target: { value: ' Tuesdays and Fridays ' },
		});
		fireEvent.click(saveButton());
		await screen.findByRole('button', { name: 'Edit' });
		expect(requestNewsletterEdit).toHaveBeenCalledWith(
			123,
			expect.objectContaining({ frequency: 'Tuesdays and Fridays' }),
		);
	});

	it('keeps an existing group that is not in the options', () => {
		render(
			<AttributesPanel
				newsletter={newsletterFixture({ group: 'cancelled' })}
			/>,
		);
		edit();
		expect(selectButton('MMA group')).toHaveTextContent('cancelled');
	});

	it('does not allow saving without a name', () => {
		render(<AttributesPanel newsletter={original} />);
		edit();
		fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
			target: { value: '  ' },
		});
		expect(screen.getByText('Enter a name')).toBeVisible();
		expect(saveButton()).toBeDisabled();
	});

	it('discards cancelled changes', () => {
		render(<AttributesPanel newsletter={original} />);
		edit();
		fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
			target: { value: 'Discard' },
		});
		fireEvent.click(statusRadio('Cancelled'));
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		edit();
		expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
			original.name,
		);
		expect(statusRadio('Live')).toBeChecked();
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
	});

	it('does not offer editing to view-only users', () => {
		mockPermissions(viewerPermissions);
		render(<AttributesPanel newsletter={original} />);
		expect(
			screen.queryByRole('button', { name: 'Edit' }),
		).not.toBeInTheDocument();
	});
});
