Feature: Draft newsletter detail page
	Editors can see setup progress, continue setup and delete a draft.
	Rendering options are optional and do not add a required setup step.

	Background:
		Given an editor's workspace uses the Stand design

	Scenario: An incomplete draft shows matching progress and read-only details
		Given an article-based draft "Morning briefing" with 1 required setup steps complete and no rendering options
		When the editor opens the draft page for "Morning briefing"
		Then the draft page shows 1 of 5 required steps complete
		And the header shows a "Draft • 20%" status badge
		And the draft details are read-only
		And the "Attributes" panel shows:
			| label     | value  |
			| Frequency | Weekly |
		When the editor continues setup for "Morning briefing"
		Then the setup wizard for "Morning briefing" is shown

	Scenario: A completed draft can request launch without configuring article rendering
		Given an article-based draft "Ready briefing" with 5 required setup steps complete and no rendering options
		When the editor opens the draft page for "Ready briefing"
		Then the draft page shows 5 of 5 required steps complete
		And the header shows a "Ready to launch" status badge
		And the draft page offers edit, launch and optional rendering links for "Ready briefing"
		When the editor requests launch for "Ready briefing"
		Then launch validation accepts "Ready briefing" without rendering options

	Scenario: Cancelling keeps a draft and confirming deletion removes it
		Given an article-based draft "Delete briefing" with 1 required setup steps complete and no rendering options
		When the editor opens the draft page for "Delete briefing"
		And the editor cancels deleting the draft
		Then the draft "Delete briefing" still exists
		When the editor confirms deletion of "Delete briefing"
		Then the editor is taken to the All Newsletters page
		And the draft "Delete briefing" is deleted with a confirmation toast

	Scenario: A viewer sees progress without setup, launch or delete actions
		Given an article-based draft "Read-only briefing" with 5 required setup steps complete and no rendering options
		And the editor cannot edit newsletters
		When the editor opens the draft page for "Read-only briefing"
		Then the draft page shows 5 of 5 required steps complete
		And the draft details are read-only
		And the "Attributes" panel shows:
			| label     | value  |
			| Frequency | Weekly |
		And the draft page has no setup, launch, rendering or delete actions
