import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SegmentedProgressBar } from './SegmentedProgressBar';

const segmentStates = () =>
	screen
		.getAllByTestId('progress-segment')
		.map((segment) => segment.getAttribute('data-complete'));

describe('SegmentedProgressBar', () => {
	it('shows the label, count and filled segments when part done', () => {
		render(
			<SegmentedProgressBar
				label="Set-up in progress"
				completed={4}
				total={5}
				countLabel="4 of 5 required steps complete"
			/>,
		);

		expect(screen.getByText('Set-up in progress')).toBeTruthy();
		expect(screen.getByText('4 of 5 required steps complete')).toBeTruthy();
		expect(segmentStates()).toEqual(['true', 'true', 'true', 'true', 'false']);
	});

	it('shows no filled segments when nothing is done', () => {
		render(
			<SegmentedProgressBar
				label="Set-up in progress"
				completed={0}
				total={5}
			/>,
		);

		expect(screen.getByText('0 of 5 steps complete')).toBeTruthy();
		expect(segmentStates()).toEqual([
			'false',
			'false',
			'false',
			'false',
			'false',
		]);
		expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
			'0',
		);
	});

	it('is announced as a progress bar named by its label, at 4 of 5', () => {
		render(
			<SegmentedProgressBar
				label="Set-up in progress"
				completed={4}
				total={5}
				countLabel="4 of 5 required steps complete"
			/>,
		);

		const progressBar = screen.getByRole('progressbar', {
			name: 'Set-up in progress',
		});
		expect(progressBar.getAttribute('aria-valuenow')).toBe('4');
		expect(progressBar.getAttribute('aria-valuemin')).toBe('0');
		expect(progressBar.getAttribute('aria-valuemax')).toBe('5');
		expect(progressBar.getAttribute('aria-valuetext')).toBe(
			'4 of 5 required steps complete',
		);
	});

	it('hides the decorative segments from screen readers', () => {
		render(
			<SegmentedProgressBar
				label="Set-up in progress"
				completed={1}
				total={5}
			/>,
		);

		const segments = screen.getAllByTestId('progress-segment');
		expect(segments[0]?.parentElement?.getAttribute('aria-hidden')).toBe(
			'true',
		);
	});

	it('keeps completed within 0 and total', () => {
		render(
			<SegmentedProgressBar
				label="Set-up in progress"
				completed={7}
				total={3}
			/>,
		);

		expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(
			'3',
		);
		expect(segmentStates()).toEqual(['true', 'true', 'true']);
	});

	it('renders actions alongside the bar', () => {
		render(
			<SegmentedProgressBar
				label="Ready to launch"
				completed={5}
				total={5}
				actions={<button type="button">Launch</button>}
			/>,
		);

		expect(screen.getByRole('button', { name: 'Launch' })).toBeTruthy();
	});
});
