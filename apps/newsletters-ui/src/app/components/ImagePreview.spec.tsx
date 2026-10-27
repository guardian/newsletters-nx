import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
	ImagePlaceholder,
	ImagePreview,
	type ImageShape,
} from './ImagePreview';

afterEach(cleanup);

describe('ImagePreview', () => {
	it.each<[ImageShape, string, string]>([
		['card', '80px', '55px'],
		['square', '55px', '55px'],
	])(
		'shows a %s image at %s by %s, as in the design',
		(shape, width, height) => {
			render(
				<ImagePreview
					src="https://example.com/a.jpg"
					alt="Preview"
					shape={shape}
				/>,
			);
			const style = getComputedStyle(
				screen.getByRole('img', { name: 'Preview' }),
			);
			expect(style.width).toBe(width);
			expect(style.height).toBe(height);
			expect(style.objectFit).toBe('cover');
		},
	);

	it.each<ImageShape>(['banner', 'mobileBanner'])(
		'shows a %s image 50px high without cropping it',
		(shape) => {
			render(
				<ImagePreview
					src="https://example.com/a.jpg"
					alt="Preview"
					shape={shape}
				/>,
			);
			const style = getComputedStyle(
				screen.getByRole('img', { name: 'Preview' }),
			);
			expect(style.height).toBe('50px');
			expect(style.width).toBe('auto');
			expect(style.objectFit).toBe('contain');
		},
	);
});

describe('ImagePlaceholder', () => {
	it.each<[ImageShape, string, string]>([
		['banner', '285px', '50px'],
		['mobileBanner', '167px', '50px'],
		['card', '80px', '55px'],
		['square', '55px', '55px'],
	])(
		'sizes the empty %s box to %s by %s, as in the design',
		(shape, width, height) => {
			render(<ImagePlaceholder shape={shape} />);
			const style = getComputedStyle(screen.getByTestId('image-placeholder'));
			expect(style.width).toBe(width);
			expect(style.height).toBe(height);
		},
	);

	it('is hidden from assistive technology and adds no text', () => {
		render(<ImagePlaceholder shape="square" />);
		const placeholder = screen.getByTestId('image-placeholder');
		expect(placeholder.getAttribute('aria-hidden')).toBe('true');
		expect(placeholder.textContent).toBe('');
	});
});
