import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { ImageShape } from './ImageField';
import { ImageInput, useImageDraft } from './ImageField';

afterEach(() => {
	cleanup();
});

const label = 'Newsletter square (1:1)';
const savedUrl = 'https://uploads.guim.co.uk/2025/06/30/Business_1-1.jpg';
const newUrl = 'https://uploads.guim.co.uk/2025/07/01/New_1-1.jpg';

/** Renders one ImageInput the way the Images panel does, starting from `initial`. */
const Harness = ({
	initial,
	shape = 'square',
}: {
	initial?: string;
	shape?: ImageShape;
}) => {
	const draft = useImageDraft();
	useEffect(() => {
		draft.start(initial);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- only start once, like pressing Edit
	}, []);
	return (
		<>
			<ImageInput label={label} shape={shape} draft={draft} />
			<output data-testid="can-save">{String(draft.canSave)}</output>
		</>
	);
};

const input = () =>
	screen.getByRole<HTMLInputElement>('textbox', { name: label });
const typeUrl = (value: string) => {
	fireEvent.change(input(), { target: { value } });
};
// Previews are decorative and hidden until loaded, so they have no role.
const preview = () => document.querySelector('img');
const canSave = () => screen.getByTestId('can-save').textContent;

const checking = () => screen.queryByText('Checking image…');
const loaded = () => screen.queryByText('Image loaded');
const failed = () =>
	screen.queryByText(
		"Couldn't load an image from that URL. Check the link and try again.",
	);

describe('ImageInput', () => {
	it('shows the label, an empty input with a placeholder and a "No image" box when there is no image', () => {
		render(<Harness />);

		expect(screen.getByText(label)).toBeTruthy();
		expect(input().getAttribute('placeholder')).toBe('Paste image URL');
		expect(input().value).toBe('');
		expect(screen.getByText('No image')).toBeTruthy();
		expect(preview()).toBeNull();
		expect(checking()).toBeNull();
		expect(loaded()).toBeNull();
		expect(failed()).toBeNull();
		expect(canSave()).toBe('true');
	});

	it('shows "Loading" and "Checking image…" while the current image loads', () => {
		render(<Harness initial={savedUrl} />);

		expect(input().value).toBe(savedUrl);
		expect(screen.getByText('Loading')).toBeTruthy();
		expect(checking()).toBeTruthy();
		expect(preview()?.getAttribute('src')).toBe(savedUrl);
		// The saved image is unchanged, so checking it doesn't block saving.
		expect(canSave()).toBe('true');
	});

	it('still allows saving when the unchanged saved image is broken', () => {
		render(<Harness initial={savedUrl} />);
		fireEvent.error(preview()!);

		expect(failed()).toBeTruthy();
		expect(canSave()).toBe('true');
	});

	it('blocks saving when a broken saved image is replaced with another broken one', () => {
		render(<Harness initial={savedUrl} />);
		fireEvent.error(preview()!);
		typeUrl(newUrl);
		fireEvent.error(preview()!);

		expect(failed()).toBeTruthy();
		expect(canSave()).toBe('false');
	});

	it('shows the preview without an "Image loaded" message when the existing image loads', () => {
		render(<Harness initial={savedUrl} />);
		fireEvent.load(preview()!);

		expect(screen.queryByText('Loading')).toBeNull();
		expect(screen.queryByText('No image')).toBeNull();
		expect(checking()).toBeNull();
		expect(loaded()).toBeNull();
		expect(canSave()).toBe('true');
	});

	it('shows "Image loaded" when a new URL loads', () => {
		render(<Harness initial={savedUrl} />);
		typeUrl(newUrl);
		expect(checking()).toBeTruthy();

		fireEvent.load(preview()!);

		expect(checking()).toBeNull();
		expect(loaded()).toBeTruthy();
		expect(canSave()).toBe('true');
	});

	it('shows an error and a "No image" box when the URL fails to load', () => {
		render(<Harness initial={savedUrl} />);
		typeUrl(newUrl);
		fireEvent.error(preview()!);

		expect(failed()).toBeTruthy();
		expect(screen.getByText('No image')).toBeTruthy();
		expect(checking()).toBeNull();
		expect(loaded()).toBeNull();
		expect(canSave()).toBe('false');
	});

	it('shows an error straight away for text that is not a URL', () => {
		render(<Harness />);
		typeUrl('not a url');

		expect(failed()).toBeTruthy();
		expect(preview()).toBeNull();
		expect(checking()).toBeNull();
		expect(canSave()).toBe('false');
	});

	it('goes back to checking when the URL changes after loading', () => {
		render(<Harness initial={savedUrl} />);
		fireEvent.load(preview()!);
		typeUrl(newUrl);

		expect(checking()).toBeTruthy();
		expect(screen.getByText('Loading')).toBeTruthy();
		expect(canSave()).toBe('false');
	});

	it('clears all messages and allows saving when the URL is removed', () => {
		render(<Harness initial={savedUrl} />);
		typeUrl(newUrl);
		fireEvent.error(preview()!);
		typeUrl('   ');

		expect(failed()).toBeNull();
		expect(checking()).toBeNull();
		expect(screen.getByText('No image')).toBeTruthy();
		expect(canSave()).toBe('true');
	});
});
