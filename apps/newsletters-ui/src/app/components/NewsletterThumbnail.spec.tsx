import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NewsletterThumbnail } from './NewsletterThumbnail';

describe('NewsletterThumbnail', () => {
	it('renders a decorative thumbnail image when a src is given', () => {
		render(<NewsletterThumbnail src="https://example.com/thumb.png" />);

		const image = screen.getByRole('presentation');
		expect(image.tagName).toBe('IMG');
		expect(image.getAttribute('src')).toBe('https://example.com/thumb.png');
		expect(image.getAttribute('alt')).toBe('');
	});

	it('renders a decorative fallback when there is no src', () => {
		render(<NewsletterThumbnail />);

		expect(screen.queryByRole('img')).toBeNull();
		expect(screen.getByText('No image')).toBeTruthy();
	});
});
