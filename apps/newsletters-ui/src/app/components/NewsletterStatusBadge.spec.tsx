import type {
	DraftNewsletterData,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NewsletterStatusBadge } from './NewsletterStatusBadge';

// Satisfies every required field, so it's 100% complete as a draft.
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

// 90% complete: missing its two sign-up description fields.
const NINETY_PERCENT_COMPLETE_DRAFT: DraftNewsletterData = {
	...READY_TO_LAUNCH_DRAFT,
	signUpDescription: undefined,
	signUpEmbedDescription: undefined,
};

const LIVE_NEWSLETTER: NewsletterData = {
	...READY_TO_LAUNCH_DRAFT,
	category: 'article-based-legacy',
	status: 'live',
};

describe('NewsletterStatusBadge', () => {
	it.each([
		['live', 'Live'],
		['pending', 'Pending'],
		['cancelled', 'Cancelled'],
		['paused', 'Paused'],
	] as const)('shows "%s" newsletters as "%s"', (status, expectedLabel) => {
		render(
			<NewsletterStatusBadge newsletter={{ ...LIVE_NEWSLETTER, status }} />,
		);

		expect(screen.getByText(expectedLabel)).toBeTruthy();
	});

	it('shows an empty draft as "Draft • 0%"', () => {
		render(<NewsletterStatusBadge draft={{}} />);

		expect(screen.getByText('Draft • 0%')).toBeTruthy();
	});

	it('shows a partially complete draft as "Draft • 90%"', () => {
		render(<NewsletterStatusBadge draft={NINETY_PERCENT_COMPLETE_DRAFT} />);

		expect(screen.getByText('Draft • 90%')).toBeTruthy();
	});

	it('shows a fully complete draft as "Ready to launch"', () => {
		render(<NewsletterStatusBadge draft={READY_TO_LAUNCH_DRAFT} />);

		expect(screen.getByText('Ready to launch')).toBeTruthy();
	});
});
