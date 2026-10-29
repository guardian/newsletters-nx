import '@testing-library/jest-dom/vitest';
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
const response = (valid: boolean) => ({
	ok: true,
	json: () => Promise.resolve({ ok: true, data: { valid } }),
});

beforeEach(() => {
	vi.useFakeTimers();
	vi.clearAllMocks();
	vi.stubGlobal('fetch', fetchMock);
	fetchMock.mockResolvedValue(response(true));
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
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
		expect(onValidation).toHaveBeenCalledWith({ path: '/second', valid: true });
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
		fetchMock.mockResolvedValue(response(false));
		render(<Editor />);
		fireEvent.change(input(), { target: { value: '/missing' } });
		await advance(2000);
		expect(input()).toHaveAttribute('aria-invalid', 'true');
		expect(screen.getByText('Couldn’t find the path')).toBeVisible();
		expect(screen.queryByText('Valid path')).not.toBeInTheDocument();
		expect(onValidation).toHaveBeenCalledWith({
			path: '/missing',
			valid: false,
		});
	});

	it('shows failure and logs network errors', async () => {
		const error = new Error('Offline');
		fetchMock.mockRejectedValue(error);
		const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		render(<Editor />);
		fireEvent.change(input(), { target: { value: '/news' } });
		await advance(2000);
		expect(screen.getByText('Couldn’t find the path')).toBeVisible();
		expect(log).toHaveBeenCalledWith(
			'Failed to validate sign-up page path',
			error,
		);
	});

	it('ignores stale requests even when they resolve after the next value', async () => {
		let resolveOld: (result: ReturnType<typeof response>) => void = () => {
			throw new Error('Request not started');
		};
		fetchMock.mockImplementationOnce(
			() =>
				new Promise<ReturnType<typeof response>>((resolve) => {
					resolveOld = resolve;
				}),
		);
		render(<Editor />);
		fireEvent.change(input(), { target: { value: '/old' } });
		await advance(2000);
		fireEvent.change(input(), { target: { value: '/new' } });
		await advance(2000);
		await act(async () => {
			resolveOld(response(false));
			await Promise.resolve();
		});
		expect(screen.getByText('Valid path')).toBeVisible();
		expect(onValidation).toHaveBeenCalledExactlyOnceWith({
			path: '/new',
			valid: true,
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
