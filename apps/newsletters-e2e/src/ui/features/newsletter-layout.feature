Feature: Preview a launched newsletter's layout in Stand
	As a newsletter editor
	I want to preview an article-based newsletter inside its own page
	So that I can check the template before editing it

	Background:
		Given an editor's workspace uses the Stand design
		And the layout sample renderer is available

	Scenario: A saved preview can be opened directly and reloaded safely
		Given a layout newsletter of category "article-based-legacy"
		And layout editing is allowed
		When the editor opens its layout preview
		Then the saved layout preview and both tabs are shown
		And the Edit layout action is "visible"
		And the preview email is sandboxed and its links do not navigate
		When the editor reloads the layout preview
		Then the saved layout preview and both tabs are shown

	Scenario: An unsupported category has no Layout tab or direct preview
		Given a layout newsletter of category "fronts-based"
		When the editor opens its layout details
		Then no Layout tab is offered
		When the editor opens its layout preview
		Then the editor is returned to its layout details
		And no Layout tab is offered

	Scenario: A permissions outage does not prevent read-only previewing
		Given a layout newsletter of category "article-based"
		And layout permissions cannot be loaded
		When the editor opens its layout preview
		Then the saved layout preview and both tabs are shown
		And the Edit layout action is "hidden"

	Scenario: A failed render can be retried and renderer warnings remain visible
		Given a layout newsletter of category "article-based"
		And the next layout render fails
		When the editor opens its layout preview
		Then the layout preview explains the failure
		When the editor retries the layout preview
		Then the saved layout preview and both tabs are shown
		And the layout warning is shown beside the preview
