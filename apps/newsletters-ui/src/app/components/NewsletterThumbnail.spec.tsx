import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NewsletterThumbnail } from './NewsletterThumbnail';

describe('NewsletterThumbnail', () => {
	it('renders the thumbnail image with meaningful alt text when a src is given', () => {
		render(
			<NewsletterThumbnail
				src="https://example.com/thumb.png"
				name="Politics Weekly"
			/>,
		);

		const image = screen.getByRole('img', {
			name: 'Politics Weekly thumbnail',
		});
		expect(image.tagName).toBe('IMG');
		expect(image.getAttribute('src')).toBe('https://example.com/thumb.png');
	});

	it('renders a fallback image with meaningful alt text when there is no src', () => {
		render(<NewsletterThumbnail name="Politics Weekly" />);

		const fallback = screen.getByRole('img', {
			name: 'No thumbnail available for Politics Weekly',
		});
		expect(fallback.tagName).not.toBe('IMG');
		expect(screen.getByText('No image')).toBeTruthy();
	});
});
