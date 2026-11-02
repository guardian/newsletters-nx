import {
	levelToPermissions,
	UserAccessLevel,
} from '@newsletters-nx/newsletters-data-client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { scrollIntoView } from '../../test-utils/dom';
import { allowEditing, mockPermissions } from '../../test-utils/newsletter';
import { usePermissions } from '../hooks/user-hooks';
import { StandPanel } from './StandPanel';

vi.mock('../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));

beforeEach(() => {
	vi.resetAllMocks();
	allowEditing();
});

const Editor = ({
	save,
	validate,
}: {
	save: (value: string) => boolean | string | Promise<boolean | string>;
	validate?: (value: string) => true | string;
}) => {
	const [value, setValue] = useState('Original');
	return (
		<StandPanel
			name="Copy"
			onSave={() => save(value)}
			onValidate={validate && (() => validate(value))}
			onCancel={() => setValue('Original')}
		>
			{(isEditing) => (
				<input
					aria-label="Headline"
					readOnly={!isEditing}
					value={value}
					onChange={(event) => setValue(event.target.value)}
				/>
			)}
		</StandPanel>
	);
};

const startEditing = () =>
	fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

describe('StandPanel editing', () => {
	it.each([
		['Developer', UserAccessLevel.Developer],
		['Editor', UserAccessLevel.Editor],
	] as const)('offers editing to %s users', (_, accessLevel) => {
		mockPermissions(levelToPermissions(accessLevel));
		render(<Editor save={() => true} />);
		expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible();
		startEditing();
		expect(screen.getByText('Editing')).toBeVisible();
	});

	it('does not offer editing to Viewer users', () => {
		mockPermissions(levelToPermissions(UserAccessLevel.Viewer));
		render(<Editor save={() => true} />);
		expect(
			screen.queryByRole('button', { name: 'Edit' }),
		).not.toBeInTheDocument();
	});

	it('preserves static panels and their existing actions without requesting permissions', () => {
		render(
			<StandPanel name="Copy" actions={<span>Existing action</span>}>
				Copy text
			</StandPanel>,
		);
		expect(screen.getByText('Copy text')).toBeVisible();
		expect(screen.getByText('Existing action')).toBeVisible();
		expect(
			screen.queryByRole('button', { name: 'Edit' }),
		).not.toBeInTheDocument();
		expect(usePermissions).not.toHaveBeenCalled();
		expect(scrollIntoView).not.toHaveBeenCalled();
	});

	it.each([false, undefined])(
		'does not offer editing without edit access (%s)',
		(access) => {
			mockPermissions(
				access === undefined
					? undefined
					: { editEverything: access, useJsonEditor: false },
			);
			render(<Editor save={() => true} />);
			expect(
				screen.queryByRole('button', { name: 'Edit' }),
			).not.toBeInTheDocument();
			expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
		},
	);

	it('enters edit mode and cancels without saving', () => {
		const save = vi.fn(() => true);
		render(<Editor save={save} />);
		startEditing();
		expect(screen.getByText('Editing')).toBeVisible();
		expect(screen.getByRole('textbox')).not.toHaveAttribute('readonly');
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'Changed' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible();
		expect(screen.getByRole('textbox')).toHaveValue('Original');
		expect(save).not.toHaveBeenCalled();
		expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({
			block: 'start',
		});
		expect(scrollIntoView.mock.contexts[0]).toBe(
			screen.getByRole('heading', { name: 'Copy' }).closest('section'),
		);
	});

	it('returns to read-only mode after a successful save', async () => {
		const save = vi.fn(() => true);
		render(<Editor save={save} />);
		startEditing();
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'Changed' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		await screen.findByRole('button', { name: 'Edit' });
		expect(save).toHaveBeenCalledWith('Changed');
		expect(screen.getByRole('textbox')).toHaveValue('Changed');
		expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
		expect(scrollIntoView).toHaveBeenLastCalledWith({
			block: 'start',
		});
		expect(scrollIntoView.mock.contexts.at(-1)).toBe(
			screen.getByRole('heading', { name: 'Copy' }).closest('section'),
		);
	});

	it('keeps the editor mounted and retains values when saving fails, then allows retry', async () => {
		const save = vi
			.fn()
			.mockResolvedValueOnce(false)
			.mockResolvedValueOnce(true);
		render(<Editor save={save} />);
		startEditing();
		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'Keep my edits' } });
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Your edits have been kept',
		);
		expect(screen.getByRole('textbox')).toBe(input);
		expect(input).toHaveValue('Keep my edits');
		expect(input).not.toHaveAttribute('readonly');
		expect(scrollIntoView).toHaveBeenCalledWith({
			block: 'start',
		});
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		await screen.findByRole('button', { name: 'Edit' });
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('does not show validation errors before the first save attempt', () => {
		render(
			<Editor save={() => true} validate={() => 'Please fix the field'} />,
		);
		startEditing();
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'Typing' },
		});
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('does not scroll or save when validation fails, then scrolls once it passes', async () => {
		const save = vi.fn(() => true);
		render(
			<Editor
				save={save}
				validate={(value) => value === 'Valid' || 'Please fix the field'}
			/>,
		);
		startEditing();
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Please fix the field',
		);
		expect(save).not.toHaveBeenCalled();
		expect(scrollIntoView).not.toHaveBeenCalled();
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'Still wrong' },
		});
		expect(screen.getByRole('alert')).toHaveTextContent('Please fix the field');
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'Valid' },
		});
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'Invalid again' },
		});
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Please fix the field',
		);
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'Valid' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		await screen.findByRole('button', { name: 'Edit' });
		expect(save).toHaveBeenCalledExactlyOnceWith('Valid');
		expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
	});

	it('shows only the specific save error and clears it on cancel', async () => {
		render(<Editor save={() => 'Unable to save Copy'} />);
		startEditing();
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'Keep this' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		const alert = await screen.findByRole('alert');
		expect(alert).toHaveTextContent('Unable to save changes');
		expect(alert).toHaveTextContent('Unable to save Copy');
		expect(alert.closest('form')?.lastElementChild).toContainElement(alert);
		expect(screen.getAllByRole('alert')).toHaveLength(1);
		expect(screen.getByRole('textbox')).toHaveValue('Keep this');
		expect(screen.getByText('Editing')).toBeVisible();
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		startEditing();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it.each(['', '   '])(
		'uses the generic error for an empty message (%j)',
		async (message) => {
			render(<Editor save={() => message} />);
			startEditing();
			fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
			expect(await screen.findByRole('alert')).toHaveTextContent(
				'Changes could not be saved. Your edits have been kept. Please try again.',
			);
		},
	);

	it('reports thrown errors without discarding edits', async () => {
		const error = new Error('Network unavailable');
		const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		render(
			<Editor
				save={() => {
					throw error;
				}}
			/>,
		);
		startEditing();
		fireEvent.change(screen.getByRole('textbox'), {
			target: { value: 'Keep this' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		await screen.findByRole('alert');
		expect(log).toHaveBeenCalledWith('Failed to save panel changes', error);
		expect(screen.getByRole('textbox')).toHaveValue('Keep this');
	});

	it('disables save and cancel while an asynchronous save is pending', async () => {
		let finish: (result: boolean) => void = () => {
			throw new Error('Save not started');
		};
		const save = vi.fn(
			() =>
				new Promise<boolean>((resolve) => {
					finish = resolve;
				}),
		);
		render(<Editor save={save} />);
		startEditing();
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		expect(
			screen.getByRole('button', { name: 'Saving changes...' }),
		).toBeDisabled();
		expect(screen.getByRole('textbox')).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
		expect(save).toHaveBeenCalledTimes(1);
		finish(true);
		await waitFor(() =>
			expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible(),
		);
	});

	it('asks the browser to confirm leaving only while editing', async () => {
		const unload = () => {
			const event = new Event('beforeunload', { cancelable: true });
			window.dispatchEvent(event);
			return event.defaultPrevented;
		};
		render(<Editor save={() => true} />);
		expect(unload()).toBe(false);

		startEditing();
		expect(unload()).toBe(true);

		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(unload()).toBe(false);

		startEditing();
		fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
		await waitFor(() =>
			expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible(),
		);
		expect(unload()).toBe(false);
	});

	it('stops asking to confirm leaving when an editing panel unmounts', () => {
		const { unmount } = render(<Editor save={() => true} />);
		startEditing();
		unmount();

		const event = new Event('beforeunload', { cancelable: true });
		window.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
	});
});
