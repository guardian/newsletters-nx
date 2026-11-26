Feature: Preview a launched newsletter's layout in Stand
	As a newsletter editor
	I want to preview an article-based newsletter inside its own page
	So that I can check the template before editing it

	Background:
		Given an editor's workspace uses the Stand design
		And the layout sample renderer is available

	Scenario Outline: Both article-based categories have a reloadable Layout tab
		Given a layout newsletter of category "<category>"
		When the editor opens its layout preview
		Then the saved layout preview and both tabs are shown
		When the editor reloads the layout preview
		Then the saved layout preview and both tabs are shown

		Examples:
			| category             |
			| article-based        |
			| article-based-legacy |

	Scenario Outline: Other categories have no Layout tab, including at a direct address
		Given a layout newsletter of category "<category>"
		When the editor opens its layout details
		Then no Layout tab is offered
		When the editor opens its layout preview
		Then the editor is returned to its layout details
		And no Layout tab is offered

		Examples:
			| category     |
			| fronts-based |
			| manual-send  |
			| other        |

	Scenario Outline: The preview offers each email width
		Given a layout newsletter of category "article-based"
		When the editor opens its layout preview
		And the editor selects preview width <width>
		Then the email document uses width <width>

		Examples:
			| width |
			| 320   |
			| 375   |
			| 425   |
			| 650   |

	Scenario Outline: Edit layout is permission controlled
		Given a layout newsletter of category "article-based"
		And layout editing permission is "<permission>"
		When the editor opens its layout preview
		Then the Edit layout action is "<visibility>"

		Examples:
			| permission | visibility |
			| allowed    | visible    |
			| denied     | hidden     |

	Scenario: A permissions outage does not prevent read-only previewing
		Given a layout newsletter of category "article-based"
		And layout permissions cannot be loaded
		When the editor opens its layout preview
		Then the saved layout preview and both tabs are shown
		And the Edit layout action is "hidden"

	Scenario: Slow permissions do not delay the preview
		Given a layout newsletter of category "article-based"
		And layout permissions remain pending
		When the editor opens its layout preview
		Then the saved layout preview and both tabs are shown
		And the Edit layout action is "hidden"

	Scenario: A failed rendering request can be retried
		Given a layout newsletter of category "article-based"
		And the next layout render fails
		When the editor opens its layout preview
		Then the layout preview explains the failure
		When the editor retries the layout preview
		Then the saved layout preview and both tabs are shown

	Scenario: Renderer warnings remain visible
		Given a layout newsletter of category "article-based"
		And the layout renderer returns a warning
		When the editor opens its layout preview
		Then the layout warning is shown beside the preview

	Scenario: The preview is usable on mobile without page overflow
		Given a layout newsletter of category "article-based"
		And the layout viewport is mobile sized
		When the editor opens its layout preview
		Then the saved layout preview and both tabs are shown
		And the layout preview fits within the page
		When the editor selects preview width 320
		Then the email document uses width 320

	Scenario: Switching tabs remounts a working preview
		Given a layout newsletter of category "article-based"
		When the editor opens its layout details
		And the editor selects the "Layout" tab
		Then the saved layout preview and both tabs are shown
		When the editor selects the "Details" tab
		Then the "Details" tab is selected
		When the editor selects the "Layout" tab
		Then the saved layout preview and both tabs are shown
		When the editor selects preview width 375
		Then the email document uses width 375

	Scenario: Draft newsletters do not offer the launched Layout tab
		Given an incomplete article-based draft "Layout draft" with no rendering options
		When the editor opens the layout draft page
		Then the layout draft has no launched preview controls

	Scenario: Preview email links and scripts cannot navigate the editor
		Given a layout newsletter of category "article-based"
		When the editor opens its layout preview
		Then the preview email is sandboxed and its links do not navigate

	Scenario: An unknown newsletter has no preview controls
		When the editor goes to "/newsletters/no-such-layout-newsletter/layout"
		Then the layout page explains that the newsletter was not found
