Feature: Launched newsletter: open it and find my way around
	As a newsletter editor
	I want to open a launched newsletter, see which one I'm on and get to the part
	I need
	So that I don't change the wrong one or scroll through a long page

	# Drafts get their own feature files later, because their data comes from a
	# different source.
	Background:
		Given an editor's workspace uses the Stand design

	Rule: A launched newsletter opens on its own page

		Scenario: A newsletter's page can be opened from its address
			Given a launched newsletter "Afternoon update" with identity name "afternoon-update"
			When the editor goes to "/newsletters/afternoon-update"
			Then the detail page for "Afternoon update" is shown
			And the "Details" tab is selected

		Scenario: An address for a newsletter that doesn't exist shows an error
			When the editor goes to "/newsletters/no-such-newsletter"
			Then the editor sees the not found page

	Rule: The header identifies the newsletter

		Scenario: A launched newsletter shows its name, label and status
			Given a launched newsletter "Afternoon update" with status "pending" and region focus "AU"
			When the editor opens the detail page for "Afternoon update"
			Then the header shows the title "Afternoon update"
			And the header shows the label "News | Article based | Australia"
			And the header shows a "Pending" status badge

		Scenario: Details that are not set are left out of the label
			Given a launched newsletter "Afternoon update" with no region focus
			When the editor opens the detail page for "Afternoon update"
			Then the header shows the label "News | Article based"

	Rule: The header shows the newsletter's card graphic

		Scenario: A newsletter with a card graphic shows it
			Given a launched newsletter "Afternoon update" with a card graphic
			When the editor opens the detail page for "Afternoon update"
			Then the header shows the card graphic

		Scenario: A newsletter without a card graphic shows a placeholder
			Given a launched newsletter "Afternoon update" with no card graphic
			When the editor opens the detail page for "Afternoon update"
			Then the header shows "No image"

	Rule: The editor can get back to the list

		Scenario: Back to all newsletters opens the All Newsletters page
			Given a launched newsletter "Afternoon update" with status "live"
			When the editor opens the detail page for "Afternoon update"
			And the editor selects "Back to all newsletters"
			Then the editor is taken to the All Newsletters page

	Rule: Tabs separate a newsletter's details from its layout

		Scenario: The page opens on the Details tab
			Given a launched newsletter "Afternoon update"
			When the editor opens the detail page for "Afternoon update"
			Then the "Details" tab is selected

		# Temporary until the Layout tab is built. It keeps the existing preview
		# reachable.
		Scenario: The Layout tab opens the existing preview
			Given a launched newsletter "Afternoon update"
			When the editor opens the detail page for "Afternoon update"
			And the editor selects the "Layout" tab
			Then the existing preview for "Afternoon update" is shown

	Rule: The Details tab shows the newsletter's attributes

		Scenario: The Attributes panel shows what kind of newsletter it is
			Given a launched newsletter "Afternoon update" with status "pending" and region focus "AU"
			When the editor opens the detail page for "Afternoon update"
			Then the "Attributes" panel shows:
				| label              | value            |
				| Name               | Afternoon update |
				| Newsletter status  | Pending          |
				| Pillar             | News             |
				| Region focus       | AU               |
				| Type of newsletter | Article based    |

	Rule: The Details tab shows the newsletter's images

		Scenario: The Images panel lists the images in order
			Given a launched newsletter "Afternoon update" with all four images
			When the editor opens the detail page for "Afternoon update"
			Then the "Images" panel lists image URLs in this order
			And the "Images" panel shows a thumbnail for "Newsletter graphic (5:3)"

		Scenario: An image that isn't set shows "Not set"
			Given a launched newsletter "Afternoon update" with a card graphic
			When the editor opens the detail page for "Afternoon update"
			Then the "Images" panel shows:
				| label                        | value   |
				| Main banner graphic          | Not set |
				| Main banner graphic (mobile) | Not set |
				| Newsletter square (1:1)      | Not set |

	Rule: Copy shows the newsletter's reader-facing text

		Scenario: The Copy panel lists the newsletter's copy
			Given a launched newsletter "Afternoon update" with these details:
				| field                  | value                      |
				| headline               | Your afternoon briefing    |
				| sign-up description    | Sign up for the daily news |
				| embed description      | A short news briefing      |
				| success message        | Thank you for signing up   |
				| highlight card message | The news you need          |
			When the editor opens the detail page for "Afternoon update"
			Then the "Copy" panel shows:
				| label                  | value                      |
				| Headline               | Your afternoon briefing    |
				| Sign-up description    | Sign up for the daily news |
				| Embed description      | A short news briefing      |
				| Success message        | Thank you for signing up   |
				| Highlight card message | The news you need          |

		Scenario: Copy that is not defined shows Not set
			Given a launched newsletter "Afternoon update"
			When the editor opens the detail page for "Afternoon update"
			Then the "Copy" panel shows:
				| label                  | value   |
				| Headline               | Not set |
				| Success message        | Not set |
				| Highlight card message | Not set |

	Rule: Sign-up page and tags shows the newsletter's sign-up page and tags

		Scenario: The panel lists the sign-up page path and the tags
			Given a launched newsletter "Afternoon update" with these details:
				| field                        | value                                                                                                         |
				| sign-up page creation status | COMPLETED                                                                                                     |
				| tag creation status          | REQUESTED                                                                                                     |
				| sign-up page path            | /australia-news/2022/oct/13/afternoon-update-newsletter-best-daily-news-email-guardian-australia-free-sign-up |
				| series tag                   | australia-news/series/guardian-australia-afternoon-update                                                     |
			When the editor opens the detail page for "Afternoon update"
			Then the "Sign-up page and tags" panel shows:
				| label                        | value                                                                                                         |
				| Sign-up page creation status | Completed                                                                                                     |
				| Tag creation status          | Requested                                                                                                     |
				| Path to sign-up page         | /australia-news/2022/oct/13/afternoon-update-newsletter-best-daily-news-email-guardian-australia-free-sign-up |
				| Series tag                   | australia-news/series/guardian-australia-afternoon-update                                                     |
				| Tag description              | Not set                                                                                                       |
				| Campaign tag                 | Not set                                                                                                       |
				| Campaign description         | Not set                                                                                                       |

	Rule: The header adapts to the screen size

		Scenario: The header stacks on a small screen
			Given the editor is using a small viewport
			When the editor opens the detail page for a launched newsletter
			Then the header shows the title above the graphic

		Scenario: The graphic is hidden on mobile
			Given the editor is using a mobile viewport
			When the editor opens the detail page for a launched newsletter
			Then the header does not show the card graphic
