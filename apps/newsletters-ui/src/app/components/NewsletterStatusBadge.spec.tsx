import type {
	DraftNewsletterData,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
	getDraftStatusBadgeContent,
	getLaunchedStatusBadgeContent,
	NewsletterStatusBadge,
} from './NewsletterStatusBadge';

// A newsletter that satisfies every field required to be launch-ready,
// so `calculateProgress` reports 100% when it is used as a draft.
const READY_TO_LAUNCH_DRAFT: DraftNewsletterData = {
	identityName: 'tech-scape',
	name: 'TechScape',
	category: 'other',
	status: 'pending',
	restricted: false,
	emailConfirmation: false,
	brazeNewsletterName: 'Editorial_TechScape',
	brazeSubscribeAttributeName: 'TechScape_Subscribe_Email',
	brazeSubscribeEventNamePrefix: 'tech_scape',
	theme: 'news',
	group: 'News in depth',
	signUpHeadline: 'Get TechScape',
	signUpDescription:
		"Alex Hern's weekly dive in to how technology is shaping our lives",
	signUpEmbedDescription:
		"Alex Hern's weekly dive in to how technology is shaping our lives",
	regionFocus: 'UK',
	frequency: 'Weekly',
	listId: 6013,
	listIdV1: -1,
	creationTimeStamp: 87678876,
	figmaIncludesThrashers: false,
	launchDate: new Date(87678876),
	signUpPageDate: new Date(87678876),
	privateUntilLaunch: false,
	onlineArticle: 'Web for all sends',
	brazeCampaignCreationStatus: 'NOT_REQUESTED',
	signupPageCreationStatus: 'NOT_REQUESTED',
	tagCreationStatus: 'NOT_REQUESTED',
};

const LIVE_NEWSLETTER: NewsletterData = {
	...READY_TO_LAUNCH_DRAFT,
	category: 'article-based-legacy',
	status: 'live',
};

describe('getLaunchedStatusBadgeContent', () => {
	it.each([
		['live', 'Live', 'green'],
		['pending', 'Pending', 'orange'],
		['cancelled', 'Cancelled', 'grey'],
		['paused', 'Paused', 'grey'],
	] as const)(
		'maps status "%s" to label "%s" and colour "%s"',
		(status, label, color) => {
			expect(getLaunchedStatusBadgeContent(status)).toEqual({
				label,
				color,
			});
		},
	);
});

describe('getDraftStatusBadgeContent', () => {
	it('reads "Draft • n%" when progress is below 100', () => {
		expect(getDraftStatusBadgeContent({})).toEqual({
			label: 'Draft • 0%',
			color: 'yellow',
		});
	});

	it('reads "Ready to launch" once nothing is outstanding', () => {
		expect(getDraftStatusBadgeContent(READY_TO_LAUNCH_DRAFT)).toEqual({
			label: 'Ready to launch',
			color: 'warmPurple',
		});
	});
});

describe('NewsletterStatusBadge', () => {
	it('renders the launched status label as text', () => {
		render(<NewsletterStatusBadge newsletter={LIVE_NEWSLETTER} />);

		expect(screen.getByText('Live')).toBeTruthy();
	});

	it('renders the draft progress label as text', () => {
		render(<NewsletterStatusBadge draft={{}} />);

		expect(screen.getByText('Draft • 0%')).toBeTruthy();
	});

	it('renders the same badge for a draft in more than one place', () => {
		const { unmount: unmountFirst } = render(
			<NewsletterStatusBadge draft={READY_TO_LAUNCH_DRAFT} />,
		);
		expect(screen.getByText('Ready to launch')).toBeTruthy();
		unmountFirst();

		render(<NewsletterStatusBadge draft={READY_TO_LAUNCH_DRAFT} />);
		expect(screen.getByText('Ready to launch')).toBeTruthy();
	});
});
