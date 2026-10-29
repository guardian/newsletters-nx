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

const scrollIntoView = vi.fn();
beforeEach(() => {
	vi.resetAllMocks();
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ ok: true, data: { valid: true } }),
		}),
	);
	vi.mocked(usePermissions).mockReturnValue({
		editEverything: true,
		useJsonEditor: false,
	});
	scrollIntoView.mockClear();
	Object.defineProperty(Element.prototype, 'scrollIntoView', {
		configurable: true,
		value: scrollIntoView,
	});
});
afterEach(() => {
	cleanup();
	Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
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
		await screen.findByText('Valid path', {}, { timeout: 3000 });
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
		await screen.findByText('Valid path', {}, { timeout: 3000 });
		save();
		expect(await screen.findByRole('alert')).toHaveTextContent('Save rejected');
		expect(screen.getAllByRole('alert')).toHaveLength(1);
		expect(
			screen.getByRole('textbox', { name: 'Tag description' }),
		).toHaveValue('Keep this');
		save();
		await screen.findByRole('button', { name: 'Edit' });
	});

	it('blocks saving while the path is still being checked', async () => {
		render(<SignupPageAndTagsPanel newsletter={original} />);
		edit();
		save();
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
		expect(await screen.findByRole('alert')).toHaveTextContent(
			'Unable to save changesThe path to sign-up page is still being checked. Please wait and try again.',
		);
		expect(scrollIntoView).not.toHaveBeenCalled();
		expect(screen.getByText('Editing')).toBeVisible();
		await screen.findByText('Valid path');
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('hides the save error once the path passes and only shows it again on save', async () => {
		const result = (valid: boolean) =>
			({
				ok: true,
				json: () => Promise.resolve({ ok: true, data: { valid } }),
			}) as Response;
		vi.mocked(fetch).mockResolvedValue(result(false));
		render(<SignupPageAndTagsPanel newsletter={original} />);
		edit();
		save();
		expect(screen.getByRole('alert')).toHaveTextContent('still being checked');
		await screen.findByText('Couldn’t find the path');
		expect(screen.getByRole('alert')).toHaveTextContent(
			'Please enter a valid path to sign-up page',
		);
		vi.mocked(fetch).mockResolvedValue(result(true));
		const input = screen.getByRole('textbox', { name: 'Path to sign-up page' });
		fireEvent.paste(input);
		fireEvent.change(input, { target: { value: '/news/fixed' } });
		await screen.findByText('Valid path');
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		vi.mocked(fetch).mockResolvedValue(result(false));
		fireEvent.paste(input);
		fireEvent.change(input, { target: { value: '/news/broken' } });
		await screen.findByText('Couldn’t find the path');
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		save();
		expect(await screen.findByRole('alert')).toBeVisible();
		fireEvent.change(input, { target: { value: '' } });
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
	});

	it('blocks saving when the path could not be checked, without calling it invalid', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: false, status: 502 } as Response);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		render(<SignupPageAndTagsPanel newsletter={original} />);
		edit();
		await screen.findByRole('link', { name: 'Try again' });
		save();
		expect(screen.getByRole('alert')).toHaveTextContent(
			'The path to sign-up page couldn’t be checked. Select ‘Try again’ below the path to check it again.',
		);
		expect(
			screen.queryByText('Couldn’t find the path'),
		).not.toBeInTheDocument();
		expect(requestNewsletterEdit).not.toHaveBeenCalled();
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ ok: true, data: { valid: true } }),
		} as Response);
		fireEvent.click(screen.getByRole('link', { name: 'Try again' }));
		await screen.findByText('Valid path');
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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

const panelData = (
	overrides: Partial<NewsletterData> = {},
): NewsletterData => ({
	...original,
	...overrides,
});

// The text of the <dd> paired with the <dt> labelled `label`.
const valueFor = (label: string) =>
	screen.getByText(label, { exact: true, selector: 'dt' }).nextElementSibling
		?.textContent;

describe('SignupPageAndTagsPanel read-only view', () => {
	it.each([
		['NOT_REQUESTED', 'Not requested'],
		['REQUESTED', 'Requested'],
		['COMPLETED', 'Completed'],
	] as const)('shows creation status badges for %s', (status, label) => {
		render(
			<SignupPageAndTagsPanel
				newsletter={panelData({
					signupPageCreationStatus: status,
					tagCreationStatus: status,
				})}
			/>,
		);

		expect(valueFor('Sign-up page creation status')).toBe(label);
		expect(valueFor('Tag creation status')).toBe(label);
	});

	it('uses the independent creation statuses, not the newsletter status', () => {
		render(
			<SignupPageAndTagsPanel
				newsletter={panelData({
					status: 'live',
					signupPageCreationStatus: 'COMPLETED',
					tagCreationStatus: 'REQUESTED',
				})}
			/>,
		);

		expect(valueFor('Sign-up page creation status')).toBe('Completed');
		expect(valueFor('Tag creation status')).toBe('Requested');
	});

	it('shows the sign-up page and tags from the newsletter', () => {
		render(
			<SignupPageAndTagsPanel
				newsletter={panelData({
					signupPage: '/global/sign-up-for-afternoon-update',
					seriesTag: 'news/series/afternoon-update',
					seriesTagDescription: 'The afternoon news briefing',
					composerTag: 'Afternoon update (newsletter sign up)',
					composerCampaignTag: 'Sign up for the afternoon briefing',
				})}
			/>,
		);

		const panel = screen
			.getByRole('heading', { level: 3, name: 'Sign-up page and tags' })
			.closest('section');
		expect(panel).not.toBeNull();
		expect(
			within(panel!)
				.getAllByRole('heading', { level: 4 })
				.map((heading) => heading.textContent),
		).toEqual(['Sign-up page', 'Tags']);
		expect(valueFor('Path to sign-up page')).toBe(
			'/global/sign-up-for-afternoon-update',
		);
		expect(
			screen
				.getByRole('link', {
					name: '/global/sign-up-for-afternoon-update',
				})
				.getAttribute('href'),
		).toBe('https://theguardian.com/global/sign-up-for-afternoon-update');
		expect(valueFor('Series tag')).toBe('news/series/afternoon-update');
		expect(valueFor('Tag description')).toBe('The afternoon news briefing');
		expect(valueFor('Campaign tag')).toBe(
			'Afternoon update (newsletter sign up)',
		);
		expect(valueFor('Campaign description')).toBe(
			'Sign up for the afternoon briefing',
		);
	});

	it.each([undefined, ''])(
		'shows "Not set" for sign-up page and tag values that are %s',
		(value) => {
			render(
				<SignupPageAndTagsPanel
					newsletter={panelData({
						signupPage: value,
						seriesTag: value,
						seriesTagDescription: value,
						composerTag: value,
						composerCampaignTag: value,
					})}
				/>,
			);

			for (const label of [
				'Path to sign-up page',
				'Series tag',
				'Tag description',
				'Campaign tag',
				'Campaign description',
			]) {
				expect(valueFor(label)).toBe('Not set');
			}
			expect(screen.queryByRole('link')).toBeNull();
		},
	);
});
