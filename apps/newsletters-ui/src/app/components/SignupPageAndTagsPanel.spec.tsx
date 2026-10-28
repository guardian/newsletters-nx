import '@testing-library/jest-dom/vitest';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { getUserEditSchema } from '@newsletters-nx/newsletters-data-client';
import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { usePermissions } from '../hooks/user-hooks';
import { SignupPageAndTagsPanel } from './SignupPageAndTagsPanel';

vi.mock('../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));
vi.mock('../api-requests/request-newsletter-edit', () => ({
	requestNewsletterEdit: vi.fn(),
}));

const original = {
	listId: 123,
	signupPageCreationStatus: 'REQUESTED',
	tagCreationStatus: 'NOT_REQUESTED',
	signupPage: '/news/series/example',
	seriesTag: 'news/series/example',
	seriesTagDescription: 'Series description',
	composerTag: 'campaign',
	composerCampaignTag: 'Campaign description',
} as NewsletterData;

const fields = [
	['signupPage', 'Path to sign-up page'],
	['seriesTag', 'Series tag'],
	['seriesTagDescription', 'Tag description'],
	['composerTag', 'Campaign tag'],
	['composerCampaignTag', 'Campaign description'],
] as const;

beforeEach(() => {
	vi.resetAllMocks();
	vi.mocked(usePermissions).mockReturnValue({
		editEverything: true,
		useJsonEditor: false,
	});
	Object.defineProperty(Element.prototype, 'scrollIntoView', {
		configurable: true,
		value: vi.fn(),
	});
});
afterEach(() => {
	cleanup();
	Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
	vi.restoreAllMocks();
});

const edit = () =>
	fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
const save = () =>
	fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

describe('SignupPageAndTagsPanel', () => {
	it('shows current values in five single-line inputs and two status radio groups', () => {
		render(<SignupPageAndTagsPanel newsletter={original} />);
		edit();
		expect(screen.getByText('Editing')).toBeVisible();
		expect(screen.getAllByRole('textbox')).toHaveLength(5);
		for (const [key, label] of fields) {
			const input = screen.getByRole('textbox', { name: label });
			expect(input.tagName).toBe('INPUT');
			expect(input).toHaveValue(original[key]);
		}
		expect(
			within(
				screen.getByRole('radiogroup', {
					name: 'Sign-up page creation status',
				}),
			).getByRole('radio', { name: 'Requested' }),
		).toBeChecked();
		expect(
			within(
				screen.getByRole('radiogroup', { name: 'Tag creation status' }),
			).getByRole('radio', { name: 'Not requested' }),
		).toBeChecked();
		expect(screen.getAllByRole('radio')).toHaveLength(6);
	});

	it('saves only panel fields and uses the persisted response on the next edit', async () => {
		vi.mocked(requestNewsletterEdit).mockResolvedValue({
			ok: true,
			data: {
				...original,
				seriesTagDescription: 'Persisted description',
				tagCreationStatus: 'COMPLETED',
			},
		});
		render(<SignupPageAndTagsPanel newsletter={original} />);
		edit();
		fireEvent.change(screen.getByRole('textbox', { name: 'Tag description' }), {
			target: { value: 'New description' },
		});
		fireEvent.click(
			within(
				screen.getByRole('radiogroup', { name: 'Tag creation status' }),
			).getByRole('radio', { name: 'Completed' }),
		);
		save();
		await screen.findByRole('button', { name: 'Edit' });
		expect(requestNewsletterEdit).toHaveBeenCalledWith(123, {
			signupPageCreationStatus: 'REQUESTED',
			tagCreationStatus: 'COMPLETED',
			...Object.fromEntries(fields.map(([key]) => [key, original[key]])),
			seriesTagDescription: 'New description',
		});
		edit();
		expect(
			screen.getByRole('textbox', { name: 'Tag description' }),
		).toHaveValue('Persisted description');
	});

	it('discards cancelled text and status changes', () => {
		render(<SignupPageAndTagsPanel newsletter={original} />);
		edit();
		fireEvent.change(screen.getByRole('textbox', { name: 'Series tag' }), {
			target: { value: 'Discard' },
		});
		fireEvent.click(
			within(
				screen.getByRole('radiogroup', { name: 'Tag creation status' }),
			).getByRole('radio', { name: 'Completed' }),
		);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		edit();
		expect(screen.getByRole('textbox', { name: 'Series tag' })).toHaveValue(
			original.seriesTag,
		);
		expect(
			within(
				screen.getByRole('radiogroup', { name: 'Tag creation status' }),
			).getByRole('radio', { name: 'Not requested' }),
		).toBeChecked();
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
	});

	it('unsets all optional text fields when cleared', async () => {
		vi.mocked(requestNewsletterEdit).mockResolvedValue({
			ok: true,
			data: original,
		});
		render(<SignupPageAndTagsPanel newsletter={original} />);
		edit();
		for (const [, label] of fields) {
			fireEvent.change(screen.getByRole('textbox', { name: label }), {
				target: { value: '' },
			});
		}
		save();
		await screen.findByRole('button', { name: 'Edit' });
		expect(requestNewsletterEdit).toHaveBeenCalledWith(123, {
			signupPageCreationStatus: 'REQUESTED',
			tagCreationStatus: 'NOT_REQUESTED',
			...Object.fromEntries(fields.map(([key]) => [key, undefined])),
		});
	});

	it('retains the editor and shows one API error, then allows retry', async () => {
		vi.mocked(requestNewsletterEdit)
			.mockResolvedValueOnce({ ok: false, message: 'Save rejected' })
			.mockResolvedValueOnce({ ok: true, data: original });
		render(<SignupPageAndTagsPanel newsletter={original} />);
		edit();
		fireEvent.change(screen.getByRole('textbox', { name: 'Tag description' }), {
			target: { value: 'Keep this' },
		});
		save();
		expect(await screen.findByRole('alert')).toHaveTextContent('Save rejected');
		expect(screen.getAllByRole('alert')).toHaveLength(1);
		expect(
			screen.getByRole('textbox', { name: 'Tag description' }),
		).toHaveValue('Keep this');
		save();
		await screen.findByRole('button', { name: 'Edit' });
	});

	it('does not offer editing to view-only users', () => {
		vi.mocked(usePermissions).mockReturnValue({
			editEverything: false,
			useJsonEditor: false,
		});
		render(<SignupPageAndTagsPanel newsletter={original} />);
		expect(
			screen.queryByRole('button', { name: 'Edit' }),
		).not.toBeInTheDocument();
	});

	it('allows Editors to persist Tag description through the API edit schema', () => {
		const schema = getUserEditSchema({
			editEverything: true,
			useJsonEditor: false,
		});
		expect(
			schema.partial().parse({ seriesTagDescription: 'New description' }),
		).toHaveProperty('seriesTagDescription', 'New description');
	});
});
