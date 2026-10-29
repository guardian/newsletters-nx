import type { ApiResponse } from '@newsletters-nx/newsletters-data-client';
import {
	type NewsletterData,
	type WorkflowStatus,
} from '@newsletters-nx/newsletters-data-client';
import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requestNewsletterEdit } from '../api-requests/request-newsletter-edit';
import { usePermissions } from '../hooks/user-hooks';
import type { IntegrationKey } from './IntegrationsPanel';
import { IntegrationsPanel } from './IntegrationsPanel';

afterEach(() => {
	cleanup();
	// Scrolling is not supported by jsdom
	Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
});

vi.mock('../hooks/user-hooks', () => ({ usePermissions: vi.fn() }));
vi.mock('../api-requests/request-newsletter-edit', () => ({
	requestNewsletterEdit: vi.fn(),
}));
beforeEach(() => {
	vi.resetAllMocks();
	// Scrolling is not supported by jsdom
	Object.defineProperty(Element.prototype, 'scrollIntoView', {
		configurable: true,
		value: vi.fn(),
	});
});

/** The Integrations panel's section, found by its accessible name */
const integrationsPanel = () =>
	screen.findByRole('region', { name: 'Integrations' });

const integrationsPanelEditButton = async () =>
	within(await integrationsPanel()).findByRole('button', { name: 'Edit' });

const newsletter = (overrides: Partial<NewsletterData> = {}) =>
	({
		name: 'Afternoon update',
		listId: 123,
		status: 'live',
		theme: 'news',
		category: 'article-based',
		regionFocus: 'AU',
		frequency: 'Weekly',
		group: 'News in depth',
		signupPageCreationStatus: 'NOT_REQUESTED',
		tagCreationStatus: 'NOT_REQUESTED',
		brazeCampaignCreationStatus: 'NOT_REQUESTED',
		...overrides,
	}) as NewsletterData;

/** The text of a field's value, ignoring decorative (aria-hidden) content such as icons */
const valueFor = (label: string) => {
	// Strip the aria-hidden content from a copy, not from the page itself
	const value = screen
		.getByText(label, { exact: true, selector: 'dt' })
		.nextElementSibling?.cloneNode(true) as Element | undefined;
	value?.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove());
	return value?.textContent;
};

/** A newsletter whose editable integration values all pass validation */
const validIntegrations = {
	brazeNewsletterName: 'Valid_Name',
	brazeSubscribeAttributeName: 'Valid_Attribute',
	brazeSubscribeEventNamePrefix: 'valid-prefix',
	brazeSubscribeAttributeNameAlternate: ['Alternate_One'],
} satisfies Partial<NewsletterData>;

const underscoreCasedMessage =
	'Must contain letters or numbers, connected by underscores';
const kebabOrUnderscoreCasedMessage =
	'Must contain numbers or lower-case letters only, separated by dashes or underscores';

describe('IntegrationsPanel', () => {
	describe('read-only', () => {
		it('shows braze values from the newsletter', () => {
			render(
				<IntegrationsPanel
					newsletter={newsletter({
						brazeCampaignCreationStatus: 'COMPLETED',
						brazeNewsletterName: 'Editorial_AfternoonUpdate',
						brazeSubscribeAttributeName: 'AfternoonUpdate_Subscribe_Email',
						brazeSubscribeEventNamePrefix: 'afternoon_update',
					})}
				/>,
			);

			screen.getByRole('region', { name: 'Braze values' });
			expect(valueFor('Braze campaign creation status')).toBe('Completed');
			expect(valueFor('brazeNewsletterName')).toBe('Editorial_AfternoonUpdate');
			expect(valueFor('brazeSubscribeAttributeName')).toBe(
				'AfternoonUpdate_Subscribe_Email',
			);
			expect(valueFor('brazeSubscribeEventNamePrefix')).toBe(
				'afternoon_update',
			);
			expect(valueFor('braze subscribe event name')).toBe(
				'afternoon_update_subscribe_email_date',
			);
			expect(valueFor('braze unsubscribe event name')).toBe(
				'afternoon_update_unsubscribe_email_date',
			);
		});

		it('shows multiple values for the brazeSubscribeAttributeNameAlternate if provided', () => {
			render(
				<IntegrationsPanel
					newsletter={newsletter({
						brazeSubscribeAttributeNameAlternate: ['a', 'b', 'c'],
					})}
				/>,
			);

			expect(valueFor('brazeSubscribeAttributeNameAlternate')).toBe('abc');
		});

		it("shows 'Not set' for an empty brazeSubscribeAttributeNameAlternate list", () => {
			render(
				<IntegrationsPanel
					newsletter={newsletter({
						brazeSubscribeAttributeNameAlternate: [],
					})}
				/>,
			);

			expect(valueFor('brazeSubscribeAttributeNameAlternate')).toBe('Not set');
		});

		it.each([undefined, ''])(
			'shows "Not set" for braze values that are %s',
			(value) => {
				render(
					<IntegrationsPanel
						newsletter={newsletter({
							brazeNewsletterName: value,
							brazeSubscribeAttributeName: value,
							brazeSubscribeEventNamePrefix: value,
						})}
					/>,
				);

				for (const label of [
					'brazeNewsletterName',
					'brazeSubscribeAttributeName',
					'brazeSubscribeEventNamePrefix',
					'braze subscribe event name',
					'braze unsubscribe event name',
				]) {
					expect(valueFor(label)).toBe('Not set');
				}
			},
		);

		it('shows ophan values from the newsletter', () => {
			render(
				<IntegrationsPanel
					newsletter={newsletter({
						campaignName: 'AfternoonUpdate',
						campaignCode: 'AfternoonUpdate_Email',
					})}
				/>,
			);

			screen.getByRole('region', { name: 'Ophan values' });
			expect(valueFor('Campaign name')).toBe('AfternoonUpdate');
			expect(valueFor('Campaign code')).toBe('AfternoonUpdate_Email');
		});

		it.each([undefined, ''])(
			'shows "Not set" for ophan values that are %s',
			(value) => {
				render(
					<IntegrationsPanel
						newsletter={newsletter({
							campaignName: value,
							campaignCode: value,
						})}
					/>,
				);

				expect(valueFor('Campaign name')).toBe('Not set');
				expect(valueFor('Campaign code')).toBe('Not set');
			},
		);
	});

	describe('edit mode', () => {
		beforeEach(() => {
			vi.mocked(usePermissions).mockReturnValue({
				editEverything: true,
				useJsonEditor: false,
			});
		});
		it.each([
			['NOT_REQUESTED', 'Not Requested'],
			['REQUESTED', 'Requested'],
			['COMPLETED', 'Completed'],
		] as Array<[WorkflowStatus, string]>)(
			"shows the value from the newsletter in input 'Braze campaign creation status'",
			async (value: WorkflowStatus, name: string) => {
				render(
					<IntegrationsPanel
						newsletter={newsletter({
							brazeCampaignCreationStatus: value,
						})}
					/>,
				);
				fireEvent.click(await integrationsPanelEditButton());

				expect(
					within(
						await screen.findByRole('radiogroup', {
							name: 'Braze campaign creation status *',
						}),
					).getByRole('radio', { name: name }),
				).toBeChecked();
			},
		);
		it.each([
			[
				{ brazeSubscribeAttributeName: 'example' },
				'brazeSubscribeAttributeName',
				'example',
			],
			[
				{ brazeSubscribeEventNamePrefix: 'example' },
				'brazeSubscribeEventNamePrefix',
				'example',
			],
			[{ campaignName: 'example' }, 'Campaign name', 'example'],
			[{ campaignCode: 'example' }, 'Campaign code', 'example'],
		])(
			"shows the value from the newsletter in input '%s'",
			async (overrides: Partial<NewsletterData>, label, expectedValue) => {
				render(<IntegrationsPanel newsletter={newsletter(overrides)} />);

				fireEvent.click(await integrationsPanelEditButton());

				expect(
					screen.getByRole('textbox', { name: new RegExp(label) }),
				).toHaveValue(expectedValue);
			},
		);

		it("shows the value from the newsletter in input 'brazeSubscribeAttributeNameAlternate'", async () => {
			render(
				<IntegrationsPanel
					newsletter={newsletter({
						brazeSubscribeAttributeNameAlternate: ['a', 'b'],
					})}
				/>,
			);

			fireEvent.click(await integrationsPanelEditButton());

			const elements = await screen.findAllByRole('textbox', {
				name: 'brazeSubscribeAttributeNameAlternate item',
			});

			expect(elements.length).toBe(2);

			const expectedValues = ['a', 'b'];
			elements.forEach((e, i) => {
				expect(e).toHaveValue(expectedValues[i]);
			});
		});
	});

	describe('input validation', () => {
		beforeEach(() => {
			vi.mocked(usePermissions).mockReturnValue({
				editEverything: true,
				useJsonEditor: false,
			});
		});
		it('saves if all provided data is valid', async () => {
			const user = userEvent.setup();
			vi.mocked(requestNewsletterEdit).mockImplementation((_, changes) =>
				Promise.resolve({
					ok: true,
					data: { ...newsletter(), ...changes },
				} as ApiResponse<NewsletterData>),
			);
			render(<IntegrationsPanel newsletter={newsletter(validIntegrations)} />);

			await user.click(await integrationsPanelEditButton());
			await user.click(
				await screen.findByRole('button', { name: 'Save changes' }),
			);

			expect(requestNewsletterEdit).toHaveBeenCalledWith(
				123,
				expect.objectContaining({
					brazeNewsletterName: 'Valid_Name',
					brazeSubscribeAttributeName: 'Valid_Attribute',
					brazeSubscribeEventNamePrefix: 'valid-prefix',
					brazeSubscribeAttributeNameAlternate: ['Alternate_One'],
				}),
			);
			expect(
				await within(await integrationsPanel()).findByRole('button', {
					name: 'Edit',
				}),
			).toBeVisible();
		});

		it.each([
			['brazeNewsletterName', 'not valid!', underscoreCasedMessage],
			['brazeSubscribeAttributeName', 'not-valid', underscoreCasedMessage],
			[
				'brazeSubscribeEventNamePrefix',
				'Not_Valid',
				kebabOrUnderscoreCasedMessage,
			],
		] as Array<[IntegrationKey, string, string]>)(
			"shows a validation error if %s does not match the required format ('%s')",
			async (key, invalidValue, expectedMessage) => {
				const user = userEvent.setup();
				render(
					<IntegrationsPanel newsletter={newsletter(validIntegrations)} />,
				);

				await user.click(await integrationsPanelEditButton());
				const input = await screen.findByRole('textbox', {
					name: new RegExp(`^${key}( \\*)?$`),
				});
				await user.clear(input);
				await user.type(input, invalidValue);

				expect(input).toBeInvalid();
				expect(input).toHaveAccessibleDescription(expectedMessage);
			},
		);

		it('shows a validation error if brazeSubscribeAttributeNameAlternate does not match the required format', async () => {
			const user = userEvent.setup();
			render(<IntegrationsPanel newsletter={newsletter(validIntegrations)} />);

			await user.click(await integrationsPanelEditButton());
			const [input] = await screen.findAllByRole('textbox', {
				name: 'brazeSubscribeAttributeNameAlternate item',
			});
			await user.clear(input!);
			await user.type(input!, 'not valid!');

			expect(
				within(await integrationsPanel()).getByText(underscoreCasedMessage),
			).toBeVisible();
		});

		it.each([
			['brazeNewsletterName', 'brazeNewsletterName'],
			['brazeSubscribeAttributeName', 'brazeSubscribeAttributeName'],
			['brazeSubscribeEventNamePrefix', 'brazeSubscribeEventNamePrefix'],
		] as Array<[IntegrationKey, string]>)(
			"does not show validation error if mandatory field '%s' is empty",
			async (key: IntegrationKey, label: string) => {
				const user = userEvent.setup();
				render(
					<IntegrationsPanel
						newsletter={newsletter({
							[key]: 'example',
						})}
					/>,
				);

				await userEvent.click(await integrationsPanelEditButton());

				const input = await screen.findByRole('textbox', {
					name: new RegExp(label),
				});

				expect(input).toHaveValue('example');

				await user.clear(input);

				expect(input).toBeInvalid();

				expect(await integrationsPanel()).not.toContainAnyByText(
					'Must not be empty',
				);
			},
		);
	});

	describe('saving', () => {
		beforeEach(() => {
			vi.mocked(usePermissions).mockReturnValue({
				editEverything: true,
				useJsonEditor: false,
			});
		});

		it('retains input values if saving fails', async () => {
			const user = userEvent.setup();
			vi.mocked(requestNewsletterEdit).mockResolvedValue({
				ok: false,
				message: 'Save rejected',
			});
			render(<IntegrationsPanel newsletter={newsletter(validIntegrations)} />);

			await user.click(await integrationsPanelEditButton());
			const nameInput = await screen.findByRole('textbox', {
				name: /^brazeNewsletterName( \*)?$/,
			});
			const campaignInput = screen.getByRole('textbox', {
				name: 'Campaign name',
			});
			await user.clear(nameInput);
			await user.type(nameInput, 'Changed_Name');
			await user.type(campaignInput, 'Typed campaign');
			await user.click(
				await screen.findByRole('button', { name: 'Save changes' }),
			);

			expect(await screen.findByRole('alert')).toHaveTextContent(
				'Save rejected',
			);
			expect(requestNewsletterEdit).toHaveBeenCalledTimes(1);
			expect(screen.getByText('Editing')).toBeVisible();
			expect(nameInput).toHaveValue('Changed_Name');
			expect(campaignInput).toHaveValue('Typed campaign');
			expect(
				screen.getByRole('textbox', {
					name: 'brazeSubscribeAttributeNameAlternate item',
				}),
			).toHaveValue('Alternate_One');
		});

		it('ignores empty inputs in the brazeSubscribeAttributeNameAlternate when saving', async () => {
			const user = userEvent.setup();
			vi.mocked(requestNewsletterEdit).mockImplementation((_, changes) =>
				Promise.resolve({
					ok: true,
					data: { ...newsletter(), ...changes },
				} as ApiResponse<NewsletterData>),
			);
			render(
				<IntegrationsPanel
					newsletter={newsletter({
						...validIntegrations,
						brazeSubscribeAttributeNameAlternate: ['First_One'],
					})}
				/>,
			);

			await user.click(await integrationsPanelEditButton());
			const addButton = await screen.findByRole('button', {
				name: 'Add new item',
			});
			await user.click(addButton);
			await user.click(addButton);
			await user.click(addButton);

			const inputs = await screen.findAllByRole('textbox', {
				name: 'brazeSubscribeAttributeNameAlternate item',
			});
			expect(inputs).toHaveLength(4);
			// inputs[2] is left blank; inputs[3] holds only whitespace
			await user.type(inputs[1]!, 'Second_One');
			await user.type(inputs[3]!, '   ');

			await user.click(
				await screen.findByRole('button', { name: 'Save changes' }),
			);

			expect(requestNewsletterEdit).toHaveBeenCalledWith(
				123,
				expect.objectContaining({
					brazeSubscribeAttributeNameAlternate: ['First_One', 'Second_One'],
				}),
			);
		});
	});
});
