import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NewsletterThumbnail } from './NewsletterThumbnail';

describe('NewsletterThumbnail', () => {
	it('renders the thumbnail image with no alt text, since it is decorative', () => {
		render(<NewsletterThumbnail src="https://example.com/thumb.png" />);

		const image = screen.getByRole('presentation');
		expect(image.tagName).toBe('IMG');
		expect(image.getAttribute('src')).toBe('https://example.com/thumb.png');
	});

	it('renders a fallback that is hidden from assistive tech when there is no src', () => {
		render(<NewsletterThumbnail />);

		expect(screen.getByText('No image')).toBeTruthy();
		expect(screen.queryByRole('img')).toBeNull();
	});
});
