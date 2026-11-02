import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	failedSignupPathCheckResponse,
	signupPathCheckResponse,
} from '../../test-utils/newsletter-detail-page';
import { SignupPathInput } from './SignupPathInput';

const fetchMock = vi.fn();
const onValidation = vi.fn();
const Editor = ({ initialValue = '' }: { initialValue?: string }) => {
	const [value, setValue] = useState(initialValue);
	return (
		<SignupPathInput
			value={value}
			onChange={setValue}
			onValidation={onValidation}
		/>
	);
};
const input = () =>
	screen.getByRole('textbox', { name: 'Path to sign-up page' });
const advance = async (ms: number) => {
	await act(async () => {
		await vi.advanceTimersByTimeAsync(ms);
	});
};

beforeEach(() => {
	vi.useFakeTimers();
	vi.resetAllMocks();
	vi.stubGlobal('fetch', fetchMock);
	fetchMock.mockResolvedValue(signupPathCheckResponse(true));
});
afterEach(() => {
	vi.useRealTimers();
});

describe('SignupPathInput validation', () => {
	it('waits exactly two seconds after the last typed change', async () => {
		render(<Editor />);
		fireEvent.change(input(), { target: { value: '/first' } });
		await advance(1999);
		expect(fetchMock).not.toHaveBeenCalled();
		fireEvent.change(input(), { target: { value: '/second' } });
		await advance(1999);
		expect(fetchMock).not.toHaveBeenCalled();
		await advance(1);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith(
			'/api/signup-path-validation?path=%2Fsecond',
			expect.anything(),
		);
		expect(screen.getByText('Valid path')).toBeVisible();
		expect(onValidation).toHaveBeenCalledWith({
			path: '/second',
			status: 'valid',
		});
	});

	it('checks the existing path immediately when edit mode opens, then 2 seconds after typing', async () => {
		render(<Editor initialValue="/saved" />);
		await advance(0);
		expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
			'/api/signup-path-validation?path=%2Fsaved',
			expect.anything(),
		);
		expect(screen.getByText('Valid path')).toBeVisible();
		fireEvent.change(input(), { target: { value: '/typed' } });
		await advance(1999);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		await advance(1);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('checks pasted values without waiting two seconds', async () => {
		render(<Editor />);
		fireEvent.paste(input());
		fireEvent.change(input(), { target: { value: '/pasted' } });
		await advance(0);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(screen.getByText('Valid path')).toBeVisible();
	});

	it('uses the Stand field error below an invalid path', async () => {
		fetchMock.mockResolvedValue(signupPathCheckResponse(false));
		render(<Editor />);
		fireEvent.change(input(), { target: { value: '/missing' } });
		await advance(2000);
		expect(input()).toHaveAttribute('aria-invalid', 'true');
		expect(screen.getByText('Couldn’t find the path')).toBeVisible();
		expect(screen.queryByText('Valid path')).not.toBeInTheDocument();
		expect(onValidation).toHaveBeenCalledWith({
			path: '/missing',
			status: 'not-found',
		});
	});

	it('reports a failed check without marking the path invalid, and logs network errors', async () => {
		const error = new Error('Offline');
		fetchMock.mockRejectedValue(error);
		const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		render(<Editor />);
		fireEvent.change(input(), { target: { value: '/news' } });
		await advance(2000);
		expect(screen.getByRole('status')).toHaveTextContent(
			'Couldn’t check the path. Try again',
		);
		expect(input()).not.toHaveAttribute('aria-invalid', 'true');
		expect(
			screen.queryByText('Couldn’t find the path'),
		).not.toBeInTheDocument();
		expect(onValidation).toHaveBeenCalledWith({
			path: '/news',
			status: 'failed',
		});
		expect(log).toHaveBeenCalledWith(
			'Failed to validate sign-up page path',
			error,
		);
	});

	it.each([403, 429, 502])(
		'reports a %s response as a failed check, not an invalid path',
		async (status) => {
			fetchMock.mockResolvedValue(failedSignupPathCheckResponse(status));
			vi.spyOn(console, 'error').mockImplementation(() => undefined);
			render(<Editor />);
			fireEvent.change(input(), { target: { value: '/news' } });
			await advance(2000);
			expect(input()).not.toHaveAttribute('aria-invalid', 'true');
			expect(onValidation).toHaveBeenCalledWith({
				path: '/news',
				status: 'failed',
			});
		},
	);

	it('shows nothing while a check is pending', async () => {
		fetchMock.mockReturnValue(new Promise(() => undefined));
		render(<Editor />);
		fireEvent.change(input(), { target: { value: '/news' } });
		await advance(2000);
		expect(input()).not.toHaveAttribute('aria-invalid', 'true');
		expect(screen.queryByRole('status')).not.toBeInTheDocument();
		expect(onValidation).not.toHaveBeenCalled();
	});

	it('uses the signupPage schema to reject a badly formatted path without a lookup', async () => {
		render(<Editor />);
		fireEvent.change(input(), { target: { value: 'global/no-slash' } });
		await advance(2000);
		expect(fetchMock).not.toHaveBeenCalled();
		expect(input()).toHaveAttribute('aria-invalid', 'true');
		const origin = screen.getByText('https://www.theguardian.com');
		expect(origin).toHaveStyle({ textDecoration: 'line-through' });
		expect(origin.parentElement).toHaveTextContent(
			'Please add the path of the Guardian URL from the slash e.g. https://www.theguardian.com/global/sign-up-for-newsletter',
		);
		expect(input()).toHaveAccessibleDescription(
			/^Please add the path of the Guardian URL/,
		);
		expect(onValidation).toHaveBeenCalledWith({
			path: 'global/no-slash',
			status: 'invalid-format',
		});
	});

	it('rejects a path over 500 characters without a lookup', async () => {
		const path = `/${'a'.repeat(500)}`;
		render(<Editor />);
		fireEvent.change(input(), { target: { value: path } });
		await advance(2000);
		expect(fetchMock).not.toHaveBeenCalled();
		expect(input()).toHaveAttribute('aria-invalid', 'true');
		expect(
			screen.getByText(
				'Please check the length of the path provided. There is a 500 character limit',
			),
		).toBeVisible();
		expect(onValidation).toHaveBeenCalledWith({ path, status: 'too-long' });
	});

	it('re-runs a failed check immediately from the Try again link', async () => {
		fetchMock.mockResolvedValueOnce(failedSignupPathCheckResponse());
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		render(<Editor />);
		fireEvent.change(input(), { target: { value: '/news' } });
		await advance(2000);
		onValidation.mockClear();
		fireEvent.click(screen.getByRole('link', { name: 'Try again' }));
		expect(onValidation).toHaveBeenCalledWith(undefined);
		expect(screen.queryByRole('status')).not.toBeInTheDocument();
		await advance(0);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(screen.getByText('Valid path')).toBeVisible();
		expect(onValidation).toHaveBeenLastCalledWith({
			path: '/news',
			status: 'valid',
		});
	});

	it('ignores stale requests even when they resolve after the next value', async () => {
		let resolveOld: (result: Response) => void = () => {
			throw new Error('Request not started');
		};
		fetchMock.mockImplementationOnce(
			() =>
				new Promise<Response>((resolve) => {
					resolveOld = resolve;
				}),
		);
		render(<Editor />);
		fireEvent.change(input(), { target: { value: '/old' } });
		await advance(2000);
		fireEvent.change(input(), { target: { value: '/new' } });
		await advance(2000);
		await act(async () => {
			resolveOld(signupPathCheckResponse(false));
			await Promise.resolve();
		});
		expect(screen.getByText('Valid path')).toBeVisible();
		expect(onValidation).toHaveBeenCalledExactlyOnceWith({
			path: '/new',
			status: 'valid',
		});
	});

	it('clears feedback and cancels validation for an empty value or unmount', async () => {
		const { unmount } = render(<Editor />);
		fireEvent.change(input(), { target: { value: '/news' } });
		await advance(2000);
		fireEvent.change(input(), { target: { value: '' } });
		expect(screen.queryByText('Valid path')).not.toBeInTheDocument();
		await advance(2000);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		fireEvent.change(input(), { target: { value: '/next' } });
		unmount();
		await advance(2000);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
